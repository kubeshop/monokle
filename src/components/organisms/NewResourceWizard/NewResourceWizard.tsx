/* eslint-disable react/no-unescaped-entities */
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import {Checkbox, Form, Input, Modal, Select, TreeSelect} from 'antd';

import {InfoCircleOutlined} from '@ant-design/icons';

import fs from 'fs';
import {JSONSchemaFaker} from 'json-schema-faker';
import path from 'path';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeNewResourceWizard} from '@redux/reducers/ui';
import {registeredKindHandlersSelector} from '@redux/selectors';
import {getResourceKindSchema} from '@redux/services/schema';
import {createUnsavedResource} from '@redux/services/unsavedResource';
import {saveUnsavedResources} from '@redux/thunks/saveUnsavedResources';

import {useFolderTreeSelectData} from '@hooks/useFolderTreeSelectData';
import {useNamespaces} from '@hooks/useNamespaces';

import {getResourceKindHandler} from '@src/kindhandlers';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {hotkeys} from '@shared/constants/hotkeys';
import {FileMapType} from '@shared/models/appState';
import {FileEntry} from '@shared/models/fileEntry';
import {K8sResource} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';
import {NewResourceWizardInput} from '@shared/models/ui';
import {openNamespaceTopic, openUniqueObjectNameTopic} from '@shared/utils/shell';

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
  const fileMap = useAppSelector(state => state.main.fileMap);
  const newResourceWizardState = useAppSelector(state => state.ui.newResourceWizard);
  const registeredKindHandlers = useAppSelector(registeredKindHandlersSelector);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const osPlatform = useAppSelector(state => state.config.osPlatform);

  const [namespaces] = useNamespaces({extra: ['none', 'default']});

  const [filteredResources, setFilteredResources] = useState<K8sResource[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isResourceKindNamespaced, setIsResourceKindNamespaced] = useState<boolean>(true);
  const [isSubmitDisabled, setSubmitDisabled] = useState(true);
  const [savingDestination, setSavingDestination] = useState<string>('doNotSave');
  const [selectedFolder, setSelectedFolder] = useState(ROOT_FILE_ENTRY);
  const [selectedFile, setSelectedFile] = useState<string | undefined>();
  const [exportFileName, setExportFileName] = useState<string | undefined>('');
  const userDataDir = useAppSelector(state => state.config.userDataDir);
  const k8sVersion = useAppSelector(state => state.config.k8sVersion);
  const [generateRandom, setGenerateRandom] = useState<boolean>(false);

  const treeData = useFolderTreeSelectData();

  const lastApiVersionRef = useRef<string>();
  const lastKindRef = useRef<string>();

  const [form] = Form.useForm();
  lastKindRef.current = form.getFieldValue('kind');
  lastApiVersionRef.current = form.getFieldValue('apiVersion');

  const isFolderOpen = useMemo(() => Boolean(fileMap[ROOT_FILE_ENTRY]), [fileMap]);

  const defaultInput = newResourceWizardState.defaultInput;
  const defaultValues = useMemo(
    () =>
      defaultInput
        ? {
            ...defaultInput,
            namespace: defaultInput.namespace || SELECT_OPTION_NONE,
            selectedResourceId: defaultInput.selectedResourceId || SELECT_OPTION_NONE,
          }
        : ({namespace: SELECT_OPTION_NONE} as NewResourceWizardInput),
    [defaultInput]
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
    // depend on resourceMap since newly loaded resources could have contained CRDs that resulted in dynamically
    // created kindHandlers
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [registeredKindHandlers, resourceMap]
  );

  const getDirname = osPlatform === 'win32' ? path.win32.dirname : path.dirname;

  const generateExportFileName = async () => {
    if (fileMap[ROOT_FILE_ENTRY] && selectedFolder.startsWith(fileMap[ROOT_FILE_ENTRY].filePath)) {
      const currentFolder = selectedFolder.split(fileMap[ROOT_FILE_ENTRY].filePath).pop();

      if (currentFolder) {
        setSelectedFolder(currentFolder.slice(1));
      } else {
        setSelectedFolder(ROOT_FILE_ENTRY);
      }
      return;
    }

    let selectedFolderResources;
    if (selectedFolder === ROOT_FILE_ENTRY) {
      selectedFolderResources = Object.values(resourceMap).filter(
        resource => resource.filePath.split(path.sep).length === 2
      );
    } else {
      selectedFolderResources = Object.values(resourceMap).filter(
        resource =>
          resource.filePath.split(path.sep).length > 2 && getDirname(resource.filePath).endsWith(selectedFolder)
      );
    }
    const hasNameClash = selectedFolderResources.some(resource => resource.name === form.getFieldValue('name'));

    let fullFileName = generateFullFileName(
      form.getFieldValue('name'),
      form.getFieldValue('kind'),
      selectedFolder,
      fileMap,
      0,
      hasNameClash
    );
    setExportFileName(fullFileName);
  };

  const [resourceKindOptions, setResourceKindOptions] =
    useState<Record<string, ResourceKindHandler[]>>(kindsByApiVersion);

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
          const newFilteredResources = Object.values(resourceMap).filter(
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
  }, [defaultValues, form, kindsByApiVersion, newResourceWizardState.isOpen, resourceMap]);

  useEffect(() => {
    const currentKind = form.getFieldValue('kind');
    if (!currentKind) {
      setFilteredResources(Object.values(resourceMap));
      return;
    }
    setFilteredResources(Object.values(resourceMap).filter(resource => resource.kind === currentKind));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceMap]);

  useEffect(() => {
    if (defaultInput?.targetFolder && isFolderOpen) {
      setSavingDestination('saveToFolder');
      setSelectedFolder(defaultInput.targetFolder);
    } else if (defaultInput?.targetFile && isFolderOpen) {
      setSavingDestination('saveToFile');
      setSelectedFile(defaultInput.targetFile);
    } else {
      setSavingDestination('doNotSave');
    }

    setSubmitDisabled(!defaultValues?.name && !defaultValues?.kind && !defaultValues?.apiVersion);
  }, [defaultInput, defaultValues, isFolderOpen]);

  useEffect(() => {
    if (savingDestination !== 'saveToFolder') {
      return;
    }

    generateExportFileName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolder, savingDestination]);

  const closeWizard = () => {
    setSubmitDisabled(true);
    setResourceKindOptions(kindsByApiVersion);
    setFilteredResources(Object.values(resourceMap));
    dispatch(closeNewResourceWizard());
  };

  const onOk = () => {
    form.submit();
  };

  const onCancel = () => {
    closeWizard();
  };

  const onFormValuesChange = async (data: any) => {
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
      const kindOptionsByApiVersion = kindsByApiVersion[data.apiVersion];

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
      const selectedResource = resourceMap[data.selectedResourceId];

      if (selectedResource && lastKindRef.current !== selectedResource.kind) {
        const kindHandler = getResourceKindHandler(selectedResource.kind);

        if (kindHandler) {
          form.setFieldsValue({apiVersion: kindHandler.clusterApiVersion, kind: selectedResource.kind});

          if (!kindHandler.isNamespaced) {
            form.setFieldsValue({namespace: SELECT_OPTION_NONE});
          }

          setResourceKindOptions({[kindHandler.clusterApiVersion]: kindsByApiVersion[kindHandler.clusterApiVersion]});

          setIsResourceKindNamespaced(kindHandler.isNamespaced);
          shouldFilterResources = true;
        }
      }
    }

    if (shouldFilterResources) {
      const currentKind = form.getFieldValue('kind');

      if (!currentKind) {
        setFilteredResources(Object.values(resourceMap));
        return;
      }

      const newFilteredResources = Object.values(resourceMap).filter(resource => resource.kind === currentKind);
      setFilteredResources(newFilteredResources);
      const currentSelectedResourceId = form.getFieldValue('selectedResourceId');

      if (currentSelectedResourceId && !newFilteredResources.some(res => res.id === currentSelectedResourceId)) {
        form.setFieldsValue({selectedResourceId: SELECT_OPTION_NONE});
      }
    }

    if (savingDestination === 'saveToFolder') {
      generateExportFileName();
    }
  };

  const onFinish = (data: any) => {
    if (!data.name || !data.kind) {
      return;
    }

    createResourceProcessing();

    closeWizard();
  };

  const getFullFileName = (filename: string) => {
    if (filename.endsWith('.yaml') || filename.endsWith('.yml')) {
      return filename;
    }

    return `${filename}.yaml`;
  };

  const createResourceProcessing = () => {
    const formValues = form.getFieldsValue();

    const selectedResource =
      formValues.selectedResourceId && formValues.selectedResourceId !== SELECT_OPTION_NONE
        ? resourceMap[formValues.selectedResourceId]
        : undefined;

    let jsonTemplate = selectedResource?.content;
    if (generateRandom) {
      const schema = getResourceKindSchema(formValues.kind, k8sVersion, String(userDataDir));
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

    const newResource = createUnsavedResource(
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
      jsonTemplate
    );

    if (savingDestination !== 'doNotSave') {
      let absolutePath;

      const fullFileName = getFullFileName(formValues.name);
      if (savingDestination === 'saveToFolder' && selectedFolder) {
        absolutePath =
          selectedFolder === ROOT_FILE_ENTRY
            ? path.join(fileMap[ROOT_FILE_ENTRY].filePath, path.sep, fullFileName)
            : path.join(fileMap[ROOT_FILE_ENTRY].filePath, selectedFolder, path.sep, fullFileName);
      } else if (savingDestination === 'saveToFile' && selectedFile) {
        absolutePath = path.join(fileMap[ROOT_FILE_ENTRY].filePath, selectedFile);
      } else {
        absolutePath = path.join(fileMap[ROOT_FILE_ENTRY].filePath, path.sep, fullFileName);
      }

      dispatch(
        saveUnsavedResources({
          resourcePayloads: [{resource: newResource, absolutePath}],
          saveMode: savingDestination === 'saveToFolder' ? savingDestination : 'appendToFile',
        })
      );
    }

    setSavingDestination('doNotSave');
    closeWizard();
  };

  const filesList: string[] = useMemo(() => {
    const files: string[] = [];

    Object.entries(fileMap).forEach(([key, value]) => {
      if (value.children || !value.isSupported || value.isExcluded) {
        return;
      }
      files.push(key.replace(path.sep, ''));
    });

    return files;
  }, [fileMap]);

  const renderFileSelectOptions = useCallback(() => {
    return filesList.map(fileName => (
      <Option key={fileName} value={fileName}>
        {fileName}
      </Option>
    ));
  }, [filesList]);

  const onSelectChange = () => {
    setInputValue('');
  };

  const handleSavingDestinationChange = (value: any) => setSavingDestination(value);

  useHotkeys(
    hotkeys.CREATE_NEW_RESOURCE.key,
    () => {
      if (newResourceWizardState.isOpen) {
        form.submit();
      }
    },
    [newResourceWizardState.isOpen]
  );

  const onGenerateRandomChange = (e: any) => {
    setGenerateRandom(e.target.checked);
  };

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
            initialValue={SELECT_OPTION_NONE}
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
            <Option value="saveToFile">Add to file</Option>
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
          {savingDestination === 'saveToFile' && (
            <StyledSelect
              showSearch
              onChange={(value: any) => setSelectedFile(value)}
              value={selectedFile}
              placeholder="Select a destination file"
              style={{flex: 3}}
            >
              {renderFileSelectOptions()}
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

export default NewResourceWizard;
