/* eslint-disable react/no-unescaped-entities */
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import {Checkbox, Form, Input, Modal, Select, TreeSelect} from 'antd';

import {InfoCircleOutlined} from '@ant-design/icons';

import fs from 'fs';
import {JSONSchemaFaker} from 'json-schema-faker';
import {first} from 'lodash';
import path from 'path';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {closeNewResourceWizard} from '@redux/reducers/ui';
import {registeredKindHandlersSelector} from '@redux/selectors/resourceKindSelectors';
import {useResourceContentMapRef, useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';
import {joinK8sResource} from '@redux/services/resource';
import {getResourceKindSchema} from '@redux/services/schema';
import {createTransientResource} from '@redux/services/transientResource';
import {saveResourceToFileFolder} from '@redux/thunks/saveResourceToFileFolder';

import {useFileSelectOptions} from '@hooks/useFileSelectOptions';
import {useFileFolderTreeSelectData} from '@hooks/useFolderTreeSelectData';
import {useNamespaces} from '@hooks/useNamespaces';

import {useRefSelector, useSelectorWithRef, useStateWithRef} from '@utils/hooks';

import {getResourceKindHandler} from '@src/kindhandlers';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {hotkeys} from '@shared/constants/hotkeys';
import {AlertEnum} from '@shared/models/alert';
import {FileMapType} from '@shared/models/appState';
import {FileEntry} from '@shared/models/fileEntry';
import {K8sResource, ResourceMeta} from '@shared/models/k8sResource';
import {ResourceSavingDestination} from '@shared/models/resourceCreate';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';
import {NewResourceWizardInput} from '@shared/models/ui';
import {openNamespaceTopic, openUniqueObjectNameTopic} from '@shared/utils/shell';
import {trackEvent} from '@shared/utils/telemetry';

import {FileCategoryLabel, FileNameLabel, SaveDestinationWrapper, StyledSelect} from './NewResourceWizard.styled';

const SELECT_OPTION_NONE = '<none>';

const {Option, OptGroup} = Select;

const generateFullFileName = (
  resourceName: K8sResource['name'],
  resourceKind: K8sResource['kind'],
  selectedFolder: string,
  fileMap: FileMapType,
  suffix: number,
  includeKind?: boolean
): string => {
  const name = resourceName;
  const nameKind = includeKind ? `-${resourceKind.toLowerCase()}` : '';
  const nameSuffix = suffix ? ` (${suffix})` : '';
  const fullFileName = `${name}${nameKind}${nameSuffix}.yaml`;
  let foundFile: fs.Dirent | FileEntry | undefined;

  if (selectedFolder === ROOT_FILE_ENTRY) {
    foundFile = fileMap[`${path.sep}${fullFileName}`];
  } else {
    foundFile = fileMap[`${path.sep}${path.join(selectedFolder, fullFileName)}`];
  }

  if (foundFile) {
    if (includeKind) {
      return generateFullFileName(resourceName, resourceKind, selectedFolder, fileMap, suffix ? suffix + 1 : 2, true);
    }
    return generateFullFileName(resourceName, resourceKind, selectedFolder, fileMap, suffix ? suffix + 1 : 0, true);
  }

  return fullFileName;
};

const NewResourceWizard = () => {
  const dispatch = useAppDispatch();
  const newResourceWizardState = useAppSelector(state => state.ui.newResourceWizard);
  const registeredKindHandlers = useAppSelector(registeredKindHandlersSelector);
  const resourceFilterNamespaces = useAppSelector(state => state.main.resourceFilter.namespaces);
  const osPlatform = useAppSelector(state => state.config.osPlatform);
  const localResourceMetaMap = useResourceMetaMap('local');
  const localResourceMetaMapRef = useRef(localResourceMetaMap);
  localResourceMetaMapRef.current = localResourceMetaMap;
  const localResourceContentMapRef = useResourceContentMapRef('local');
  const fileMapRef = useRefSelector(state => state.main.fileMap);
  const [rootFolderEntry, rootFolderEntryRef] = useSelectorWithRef(state => state.main.fileMap[ROOT_FILE_ENTRY]);
  const userDataDirRef = useRefSelector(state => state.config.userDataDir);
  const k8sVersionRef = useRefSelector(state => state.config.projectConfig?.k8sVersion || state.config.k8sVersion);

  const [filteredResources, setFilteredResources] = useState<ResourceMeta[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isResourceKindNamespaced, setIsResourceKindNamespaced] = useState<boolean>(true);
  const [isSubmitDisabled, setSubmitDisabled] = useState(true);
  const [exportFileName, setExportFileName] = useState<string | undefined>('');
  const [savingDestination, setSavingDestination, savingDestinationRef] =
    useStateWithRef<ResourceSavingDestination>('doNotSave');
  const [selectedFile, setSelectedFile, selectedFileRef] = useStateWithRef<string | undefined>(undefined);
  const [selectedFolder, setSelectedFolder, selectedFolderRef] = useStateWithRef(ROOT_FILE_ENTRY);
  const [generateRandom, setGenerateRandom, generateRandomRef] = useStateWithRef<boolean>(false);

  const [namespaces] = useNamespaces({extra: ['none', 'default']});
  const getDirname = useMemo(() => (osPlatform === 'win32' ? path.win32.dirname : path.dirname), [osPlatform]);

  const treeData = useFileFolderTreeSelectData('folder');

  const lastApiVersionRef = useRef<string>();
  const lastKindRef = useRef<string>();

  const [form] = Form.useForm();
  lastKindRef.current = form.getFieldValue('kind');
  lastApiVersionRef.current = form.getFieldValue('apiVersion');

  const isFolderOpen = useMemo(() => Boolean(rootFolderEntry), [rootFolderEntry]);

  const fileSelectOptions = useFileSelectOptions();

  const defaultInput = newResourceWizardState.defaultInput;
  const defaultValues = useMemo(
    () =>
      defaultInput
        ? {
            ...defaultInput,
            namespace: first(resourceFilterNamespaces) || defaultInput.namespace || SELECT_OPTION_NONE,
            selectedResourceId: defaultInput.selectedResourceId || SELECT_OPTION_NONE,
          }
        : first(resourceFilterNamespaces)
        ? ({namespace: first(resourceFilterNamespaces)} as NewResourceWizardInput)
        : ({namespace: SELECT_OPTION_NONE} as NewResourceWizardInput),
    [defaultInput, resourceFilterNamespaces]
  );

  const kindsByApiVersion = useMemo(
    () =>
      registeredKindHandlers.reduce((result, resourcekindHandler) => {
        if (result[resourcekindHandler.clusterApiVersion]) {
          result[resourcekindHandler.clusterApiVersion].push(resourcekindHandler);
        } else {
          result[resourcekindHandler.clusterApiVersion] = [resourcekindHandler];
        }

        return result;
      }, {} as Record<string, ResourceKindHandler[]>),
    [registeredKindHandlers]
  );
  const kindsByApiVersionRef = useRef(kindsByApiVersion);
  kindsByApiVersionRef.current = kindsByApiVersion;

  const [resourceKindOptions, setResourceKindOptions] =
    useState<Record<string, ResourceKindHandler[]>>(kindsByApiVersion);

  const generateExportFileName = useCallback(async () => {
    if (rootFolderEntryRef.current && selectedFolderRef.current.startsWith(rootFolderEntryRef.current.filePath)) {
      const currentFolder = selectedFolderRef.current.split(rootFolderEntryRef.current.filePath).pop();

      if (currentFolder) {
        setSelectedFolder(currentFolder.slice(1));
      } else {
        setSelectedFolder(ROOT_FILE_ENTRY);
      }
      return;
    }

    let selectedFolderResources;
    if (selectedFolderRef.current === ROOT_FILE_ENTRY) {
      selectedFolderResources = Object.values(localResourceMetaMapRef.current).filter(
        resource => resource.origin.filePath.split(path.sep).length === 2
      );
    } else {
      selectedFolderResources = Object.values(localResourceMetaMapRef.current).filter(
        resource =>
          resource.origin.filePath.split(path.sep).length > 2 &&
          getDirname(resource.origin.filePath).endsWith(selectedFolderRef.current)
      );
    }
    const hasNameClash = selectedFolderResources.some(resource => resource.name === form.getFieldValue('name'));

    let fullFileName = generateFullFileName(
      form.getFieldValue('name'),
      form.getFieldValue('kind'),
      selectedFolderRef.current,
      fileMapRef.current,
      0,
      hasNameClash
    );
    setExportFileName(fullFileName);
  }, [form, localResourceMetaMapRef, selectedFolderRef, rootFolderEntryRef, fileMapRef, setSelectedFolder, getDirname]);

  useEffect(() => {
    const visible = newResourceWizardState.isOpen;

    if (!visible) {
      form.resetFields();
    }

    if (visible && defaultValues) {
      form.setFieldsValue(defaultValues);

      if (defaultValues.kind) {
        const kindHandler = getResourceKindHandler(defaultValues.kind);

        if (kindHandler) {
          setResourceKindOptions({[kindHandler.clusterApiVersion]: kindsByApiVersion[kindHandler.clusterApiVersion]});
          const newFilteredResources = Object.values(localResourceMetaMapRef.current).filter(
            resource => resource.kind === defaultValues.kind
          );
          setFilteredResources(newFilteredResources);
        }
      } else {
        setResourceKindOptions(kindsByApiVersion);
      }
    } else if (visible && !defaultValues) {
      setResourceKindOptions(kindsByApiVersion);
    }
  }, [defaultValues, form, kindsByApiVersion, newResourceWizardState.isOpen, localResourceMetaMapRef]);

  useEffect(() => {
    const currentKind = form.getFieldValue('kind');
    if (!currentKind) {
      setFilteredResources(Object.values(localResourceMetaMap));
      return;
    }
    setFilteredResources(Object.values(localResourceMetaMap).filter(resource => resource.kind === currentKind));
  }, [form, localResourceMetaMap]);

  useEffect(() => {
    if (defaultInput?.targetFolder && isFolderOpen) {
      setSavingDestination('saveToFolder');
      setSelectedFolder(defaultInput.targetFolder);
    } else if (defaultInput?.targetFile && isFolderOpen) {
      setSavingDestination('appendToFile');
      setSelectedFile(defaultInput.targetFile);
    } else {
      setSavingDestination('doNotSave');
    }

    setSubmitDisabled(!defaultValues?.name && !defaultValues?.kind && !defaultValues?.apiVersion);
  }, [defaultInput, defaultValues, isFolderOpen, setSelectedFolder, setSelectedFile, setSavingDestination]);

  useEffect(() => {
    if (savingDestination !== 'saveToFolder') {
      return;
    }

    generateExportFileName();
  }, [selectedFolder, savingDestination, generateExportFileName]);

  const closeWizard = useCallback(() => {
    setSubmitDisabled(true);
    setResourceKindOptions(kindsByApiVersionRef.current);
    setFilteredResources(Object.values(localResourceMetaMapRef.current));
    dispatch(closeNewResourceWizard());
  }, [dispatch, kindsByApiVersionRef, localResourceMetaMapRef]);

  const onOk = useCallback(() => {
    form.submit();
  }, [form]);

  const onCancel = useCallback(() => {
    closeWizard();
  }, [closeWizard]);

  const onFormValuesChange = useCallback(
    async (data: any) => {
      let shouldFilterResources = false;

      if (data.kind && data.kind !== lastKindRef.current) {
        // set api version when selecting kind
        const kindHandler = getResourceKindHandler(data.kind);

        if (kindHandler) {
          form.setFieldsValue({apiVersion: kindHandler.clusterApiVersion});

          if (!kindHandler.isNamespaced) {
            form.setFieldsValue({namespace: SELECT_OPTION_NONE});
          }

          setIsResourceKindNamespaced(kindHandler.isNamespaced || false);
        }

        shouldFilterResources = true;
      }

      if (data.apiVersion && data.apiVersion !== lastApiVersionRef.current && resourceKindOptions) {
        const kindOptionsByApiVersion = kindsByApiVersionRef.current[data.apiVersion];

        // filter resource kind dropdown options
        if (kindOptionsByApiVersion) {
          setResourceKindOptions({[data.apiVersion]: kindOptionsByApiVersion});
        }

        // deselect kind option if its api version is different than the selected one
        if (lastKindRef.current) {
          const kindHandler = getResourceKindHandler(lastKindRef.current);

          if (kindHandler && kindHandler.clusterApiVersion !== data.apiVersion) {
            if (kindOptionsByApiVersion && kindOptionsByApiVersion.length > 0) {
              form.setFieldsValue({kind: undefined});
              shouldFilterResources = true;
            } else {
              form.setFieldsValue({kind: ''});
            }
          }
        }
      }

      if (data.selectedResourceId && data.selectedResourceId !== SELECT_OPTION_NONE && !data.kind) {
        const selectedResource = localResourceMetaMapRef.current[data.selectedResourceId];

        if (selectedResource && lastKindRef.current !== selectedResource.kind) {
          const kindHandler = getResourceKindHandler(selectedResource.kind);

          if (kindHandler) {
            form.setFieldsValue({apiVersion: kindHandler.clusterApiVersion, kind: selectedResource.kind});

            if (!kindHandler.isNamespaced) {
              form.setFieldsValue({namespace: SELECT_OPTION_NONE});
            }

            setResourceKindOptions({
              [kindHandler.clusterApiVersion]: kindsByApiVersionRef.current[kindHandler.clusterApiVersion],
            });

            setIsResourceKindNamespaced(kindHandler.isNamespaced);
            shouldFilterResources = true;
          }
        }
      }

      if (shouldFilterResources) {
        const currentKind = form.getFieldValue('kind');

        if (!currentKind) {
          setFilteredResources(Object.values(localResourceMetaMapRef.current));
          return;
        }

        const newFilteredResources = Object.values(localResourceMetaMapRef.current).filter(
          resource => resource.kind === currentKind
        );
        setFilteredResources(newFilteredResources);
        const currentSelectedResourceId = form.getFieldValue('selectedResourceId');

        if (currentSelectedResourceId && !newFilteredResources.some(res => res.id === currentSelectedResourceId)) {
          form.setFieldsValue({selectedResourceId: SELECT_OPTION_NONE});
        }
      }

      if (savingDestination === 'saveToFolder') {
        generateExportFileName();
      }
    },
    [
      form,
      generateExportFileName,
      kindsByApiVersionRef,
      localResourceMetaMapRef,
      resourceKindOptions,
      savingDestination,
    ]
  );

  const getFullFileName = useCallback((filename: string) => {
    if (filename.endsWith('.yaml') || filename.endsWith('.yml')) {
      return filename;
    }

    return `${filename}.yaml`;
  }, []);

  const createResourceProcessing = useCallback(() => {
    const formValues = form.getFieldsValue();

    const selectedResourceMeta =
      formValues.selectedResourceId && formValues.selectedResourceId !== SELECT_OPTION_NONE
        ? localResourceMetaMapRef.current[formValues.selectedResourceId]
        : undefined;

    const selectedResourceContent =
      formValues.selectedResourceId && formValues.selectedResourceId !== SELECT_OPTION_NONE
        ? localResourceContentMapRef.current[formValues.selectedResourceId]
        : undefined;

    const selectedResource =
      selectedResourceMeta && selectedResourceContent
        ? joinK8sResource(selectedResourceMeta, selectedResourceContent)
        : undefined;

    let jsonTemplate = selectedResource?.object;
    if (generateRandomRef.current) {
      const schema = getResourceKindSchema(formValues.kind, k8sVersionRef.current, String(userDataDirRef.current));
      if (schema) {
        JSONSchemaFaker.option('failOnInvalidTypes', false);
        JSONSchemaFaker.option('failOnInvalidFormat', false);
        JSONSchemaFaker.option('useExamplesValue', true);
        JSONSchemaFaker.option('useDefaultValue', true);
        JSONSchemaFaker.option('maxItems', 1);
        JSONSchemaFaker.option('alwaysFakeOptionals', true);

        const value: any = JSONSchemaFaker.generate(schema);
        if (value) {
          delete value.status;
          delete value.metadata;
          delete value.kind;
          delete value.apiVersion;

          jsonTemplate = value;
        }
      }
    }

    const newResource = createTransientResource(
      {
        name: formValues.name,
        kind: formValues.kind,
        namespace:
          formValues.namespace === SELECT_OPTION_NONE || !getResourceKindHandler(formValues.kind)?.isNamespaced
            ? undefined
            : formValues.namespace,
        apiVersion: formValues.apiVersion,
      },
      dispatch,
      'local',
      jsonTemplate,
      savingDestinationRef.current !== 'doNotSave' ? true : undefined
    );

    trackEvent('create/resource', {resourceKind: newResource.kind});

    if (savingDestinationRef.current !== 'doNotSave') {
      let absolutePath;

      const fullFileName = getFullFileName(formValues.name);
      if (savingDestinationRef.current === 'saveToFolder' && selectedFolderRef.current) {
        absolutePath =
          selectedFolderRef.current === ROOT_FILE_ENTRY
            ? path.join(rootFolderEntryRef.current.filePath, path.sep, fullFileName)
            : path.join(rootFolderEntryRef.current.filePath, selectedFolderRef.current, path.sep, fullFileName);
      } else if (savingDestinationRef.current === 'appendToFile' && selectedFileRef.current) {
        absolutePath = path.join(rootFolderEntryRef.current.filePath, selectedFileRef.current);
      } else {
        absolutePath = path.join(rootFolderEntryRef.current.filePath, path.sep, fullFileName);
      }

      dispatch(saveResourceToFileFolder({resource: newResource, absolutePath, saveMode: savingDestinationRef.current}));
    }

    dispatch(
      setAlert({
        title: 'Resource created',
        message: `Successfully created ${newResource.name}`,
        type: AlertEnum.Success,
      })
    );

    setSavingDestination('doNotSave');
    closeWizard();
  }, [
    dispatch,
    getFullFileName,
    form,
    closeWizard,
    savingDestinationRef,
    setSavingDestination,
    rootFolderEntryRef,
    generateRandomRef,
    k8sVersionRef,
    localResourceMetaMapRef,
    localResourceContentMapRef,
    selectedFileRef,
    selectedFolderRef,
    userDataDirRef,
  ]);

  const onFinish = useCallback(
    (data: any) => {
      if (!data.name || !data.kind) {
        return;
      }

      createResourceProcessing();

      closeWizard();
    },
    [createResourceProcessing, closeWizard]
  );

  const onSelectChange = useCallback(() => {
    setInputValue('');
  }, []);

  const handleSavingDestinationChange = useCallback(
    (value: any) => setSavingDestination(value),
    [setSavingDestination]
  );

  useHotkeys(
    hotkeys.CREATE_NEW_RESOURCE.key,
    () => {
      if (newResourceWizardState.isOpen) {
        form.submit();
      }
    },
    [newResourceWizardState.isOpen]
  );

  const onGenerateRandomChange = useCallback(
    (e: any) => {
      setGenerateRandom(e.target.checked);
    },
    [setGenerateRandom]
  );

  return (
    <Modal
      title="Create Resource"
      open={newResourceWizardState.isOpen}
      onOk={onOk}
      onCancel={onCancel}
      okButtonProps={{
        disabled: isSubmitDisabled,
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={onFormValuesChange}
        onFinish={onFinish}
        onFieldsChange={(changedFields, allFields) => {
          const neededFields = allFields.filter(
            (field: any) => field.name[0] === 'name' || field.name[0] === 'kind' || field.name[0] === 'apiVersion'
          );

          const isFieldsValidated = neededFields.every(field => field.value);

          setSubmitDisabled(!isFieldsValidated);
        }}
      >
        <Form.Item
          name="name"
          label="Resource Name"
          rules={[
            {required: true, message: 'This field is required'},
            {pattern: /^[a-z0-9]$|^([a-z0-9\-])*[a-z0-9]$/, message: 'Wrong pattern'},
            {max: 63, type: 'string', message: 'Too long'},
          ]}
          tooltip={{
            title: () => (
              <span>
                Unique object name - <a onClick={openUniqueObjectNameTopic}>read more</a>
              </span>
            ),
            icon: <InfoCircleOutlined />,
          }}
        >
          <Input id="resource-name-input" maxLength={63} placeholder="Enter resource name" />
        </Form.Item>

        <Form.Item
          name="kind"
          label="Resource Kind"
          rules={[{required: true, message: 'This field is required'}]}
          tooltip={{title: 'Select the resource kind', icon: <InfoCircleOutlined />}}
        >
          <Select showSearch placeholder="Choose resource kind">
            {Object.entries(resourceKindOptions).map(([apiVersion, kindOptions]) => {
              return (
                <OptGroup label={apiVersion} key={apiVersion}>
                  {kindOptions.map(option => (
                    <Option key={option.kind} value={option.kind}>
                      {option.kind}
                    </Option>
                  ))}
                </OptGroup>
              );
            })}
          </Select>
        </Form.Item>

        <Form.Item
          name="apiVersion"
          label="API Version"
          rules={[{required: true, message: 'This field is required'}]}
          tooltip={{title: 'Enter the apiVersion', icon: <InfoCircleOutlined />}}
        >
          <Select showSearch placeholder="Choose api version">
            {Object.keys(kindsByApiVersion).map(version => (
              <Option key={version} value={version}>
                {version}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {isResourceKindNamespaced && (
          <Form.Item
            name="namespace"
            label="Namespace"
            tooltip={{
              title: () => (
                <span>
                  Namespace - <a onClick={openNamespaceTopic}>read more</a>
                </span>
              ),
              icon: <InfoCircleOutlined />,
            }}
            initialValue={first(resourceFilterNamespaces) || SELECT_OPTION_NONE}
          >
            <Select
              showSearch
              onSearch={text => {
                setInputValue(text);
              }}
              onChange={onSelectChange}
            >
              {inputValue && namespaces.every(namespace => namespace !== inputValue) ? (
                <Option key={inputValue} value={inputValue}>
                  {inputValue}
                </Option>
              ) : null}

              {namespaces
                .filter(ns => typeof ns === 'string')
                .map(namespace => (
                  <Option key={namespace} value={namespace}>
                    {namespace}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item name="generateRandomContent" label="Generate Random" initialValue={false}>
          <Checkbox onChange={onGenerateRandomChange} checked={generateRandom === true}>
            Generate random resource content based on schema definition.
          </Checkbox>
        </Form.Item>

        <Form.Item
          name="selectedResourceId"
          label="Select existing resource as template"
          initialValue={SELECT_OPTION_NONE}
        >
          <Select showSearch disabled={generateRandom}>
            <Option key={SELECT_OPTION_NONE} value={SELECT_OPTION_NONE}>
              {SELECT_OPTION_NONE}
            </Option>
            {filteredResources.map(resource => (
              <Option key={resource.id} value={resource.id}>
                {resource.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <SaveDestinationWrapper compact>
          <StyledSelect value={savingDestination} onChange={handleSavingDestinationChange}>
            <Option value="saveToFolder">Save to folder</Option>
            <Option value="appendToFile">Add to file</Option>
            <Option value="doNotSave">Don't save</Option>
          </StyledSelect>
          {savingDestination === 'saveToFolder' && (
            <TreeSelect
              treeDefaultExpandedKeys={['<root>']}
              dropdownMatchSelectWidth={false}
              value={selectedFolder}
              onChange={value => setSelectedFolder(value)}
              showSearch
              treeDefaultExpandAll
              treeData={[treeData]}
              style={{flex: 2}}
              treeNodeLabelProp="label"
            />
          )}
          {savingDestination === 'appendToFile' && (
            <StyledSelect
              showSearch
              onChange={(value: any) => setSelectedFile(value)}
              value={selectedFile}
              placeholder="Select a destination file"
              style={{flex: 3}}
            >
              {fileSelectOptions}
            </StyledSelect>
          )}
        </SaveDestinationWrapper>

        {savingDestination === 'saveToFolder' && form.getFieldValue('name') && form.getFieldValue('kind') && (
          <div style={{marginTop: '16px'}}>
            <FileCategoryLabel>File to be created:</FileCategoryLabel>
            <FileNameLabel>{exportFileName}</FileNameLabel>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default memo(NewResourceWizard);
