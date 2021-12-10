/* eslint-disable react/no-unescaped-entities */
import {useEffect, useMemo, useRef, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import {Form, Input, Modal, Select} from 'antd';

import {InfoCircleOutlined} from '@ant-design/icons';

import path from 'path/posix';

import {ROOT_FILE_ENTRY} from '@constants/constants';
import hotkeys from '@constants/hotkeys';

import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {reprocessNewResource} from '@redux/reducers/main';
import {closeNewResourceWizard} from '@redux/reducers/ui';
import {createUnsavedResource} from '@redux/services/unsavedResource';
import {saveUnsavedResource} from '@redux/thunks/saveUnsavedResource';

import {NO_NAMESPACE, useNamespaces} from '@hooks/useNamespaces';

import {useResetFormOnCloseModal} from '@utils/hooks';
import {openNamespaceTopic, openUniqueObjectNameTopic} from '@utils/shell';

import {ResourceKindHandlers, getResourceKindHandler} from '@src/kindhandlers';

import {SaveDestinationWrapper, StyledSelect} from './NewResourceWizard.styled';

const SELECT_OPTION_NONE = '<none>';
const NEW_ITEM = 'CREATE_NEW_ITEM';

const {Option} = Select;

const NewResourceWizard = () => {
  const dispatch = useAppDispatch();
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const newResourceWizardState = useAppSelector(state => state.ui.newResourceWizard);
  const [namespaces, setNamespaces] = useNamespaces({extra: ['none', 'default']});
  const [filteredResources, setFilteredResources] = useState<K8sResource[]>([]);
  const [shouldSaveToFolder, setShouldSaveState] = useState(true);
  const [savingDestination, setSavingDestination] = useState<string>('doNotSave');
  const [selectedFolder, setSelectedFolder] = useState(ROOT_FILE_ENTRY);
  const [selectedFile, setSelectedFile] = useState<string | undefined>();
  const [isSubmitDisabled, setSubmitDisabled] = useState(true);
  const [inputValue, setInputValue] = useState<string>('');
  const lastKindRef = useRef<string>();
  const defaultInput = newResourceWizardState.defaultInput;
  const defaultValues = defaultInput
    ? {
        ...defaultInput,
        namespace: defaultInput.namespace || SELECT_OPTION_NONE,
        selectedResourceId: defaultInput.selectedResourceId || SELECT_OPTION_NONE,
      }
    : undefined;

  const [form] = Form.useForm();
  lastKindRef.current = form.getFieldValue('kind');

  useResetFormOnCloseModal({form, visible: newResourceWizardState.isOpen, defaultValues});

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
    if (defaultInput?.targetFolder && fileMap[ROOT_FILE_ENTRY]) {
      setSavingDestination('saveToFolder');
      setSelectedFolder(defaultInput.targetFolder);
    }
    if (defaultInput?.targetFile && fileMap[ROOT_FILE_ENTRY]) {
      setSavingDestination('saveToFile');
      setSelectedFile(defaultInput.targetFile);
    }

    setSubmitDisabled(!defaultValues?.name && !defaultValues?.kind && !defaultValues?.apiVersion);
  }, [defaultInput]);

  const closeWizard = () => {
    setSubmitDisabled(true);
    dispatch(closeNewResourceWizard());
  };

  const onOk = () => {
    form.submit();
  };

  const onCancel = () => {
    closeWizard();
  };

  const onFormValuesChange = (data: any) => {
    let shouldFilterResources = false;
    if (data.kind && data.kind !== lastKindRef.current) {
      const kindHandler = getResourceKindHandler(data.kind);
      if (kindHandler) {
        form.setFieldsValue({
          apiVersion: kindHandler.clusterApiVersion,
        });
      }
      shouldFilterResources = true;
    }
    if (data.selectedResourceId && data.selectedResourceId !== SELECT_OPTION_NONE && !data.kind) {
      const selectedResource = resourceMap[data.selectedResourceId];
      if (selectedResource && lastKindRef.current !== selectedResource.kind) {
        form.setFieldsValue({
          kind: selectedResource.kind,
        });
      }
      shouldFilterResources = true;
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
        form.setFieldsValue({
          selectedResourceId: SELECT_OPTION_NONE,
        });
      }
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
    const jsonTemplate = selectedResource?.content;

    const newResource = createUnsavedResource(
      {
        name: formValues.name,
        kind: formValues.kind,
        namespace: formValues.namespace === NO_NAMESPACE ? undefined : formValues.namespace,
        apiVersion: formValues.apiVersion,
      },
      dispatch,
      jsonTemplate
    );

    // validate and update any possible broking incoming links that are now fixed
    dispatch(reprocessNewResource(newResource));

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

      dispatch(saveUnsavedResource({resource: newResource, absolutePath}));
    }

    setSavingDestination('doNotSave');
    closeWizard();
  };

  const foldersList = useMemo(
    () =>
      Object.entries(fileMap)
        .map(([key, value]) => ({folderName: key.replace(path.sep, ''), isFolder: Boolean(value.children)}))
        .filter(file => file.isFolder),
    [fileMap]
  );

  const fileList = useMemo(
    () =>
      Object.entries(fileMap)
        .map(([key, value]) => ({fileName: key.replace(path.sep, ''), isFolder: Boolean(value.children)}))
        .filter(file => !file.isFolder),
    [fileMap]
  );

  const renderFolderSelectOptions = () => {
    return foldersList.map(folder => (
      <Option key={folder.folderName} value={folder.folderName}>
        {folder.folderName}
      </Option>
    ));
  };

  const renderFileSelectOptions = () => {
    return fileList.map(folder => (
      <Option key={folder.fileName} value={folder.fileName}>
        {folder.fileName}
      </Option>
    ));
  };

  const onSelectChange = () => {
    setInputValue('');
  };

  const handleSavingDestinationChange = (value: any) => setSavingDestination(value);

  useHotkeys(
    hotkeys.CREATE_NEW_RESOURCE,
    () => {
      if (newResourceWizardState.isOpen) {
        form.submit();
      }
    },
    [newResourceWizardState.isOpen]
  );

  return (
    <Modal
      title="Add New Resource"
      visible={newResourceWizardState.isOpen}
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
            {pattern: /^[a-z0-9]$|^([a-z0-9\-.])*[a-z0-9]$/, message: 'Wrong pattern'},
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
          <Input maxLength={63} placeholder="Enter resource name" />
        </Form.Item>
        <Form.Item
          name="kind"
          label="Resource Kind"
          rules={[{required: true, message: 'This field is required'}]}
          tooltip={{title: 'Select the resource kind', icon: <InfoCircleOutlined />}}
        >
          <Select showSearch placeholder="Choose resource kind">
            {ResourceKindHandlers.map(kindHandler => (
              <Option key={kindHandler.kind} value={kindHandler.kind}>
                {kindHandler.kind}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="apiVersion"
          label="API Version"
          rules={[{required: true, message: 'This field is required'}]}
          tooltip={{title: 'Enter the apiVersion', icon: <InfoCircleOutlined />}}
        >
          <Input placeholder="Enter api version" />
        </Form.Item>
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
          initialValue={NO_NAMESPACE}
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
            {namespaces.map(namespace => {
              if (typeof namespace !== 'string') {
                return null;
              }

              return (
                <Option key={namespace} value={namespace}>
                  {namespace}
                </Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item
          name="selectedResourceId"
          label="Select existing resource as template"
          initialValue={SELECT_OPTION_NONE}
        >
          <Select showSearch>
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
            <Option value="saveToFile">Save to file</Option>
            <Option value="doNotSave">Don't save</Option>
          </StyledSelect>
          {savingDestination === 'saveToFolder' && (
            <StyledSelect showSearch onChange={(value: any) => setSelectedFolder(value)} value={selectedFolder}>
              {renderFolderSelectOptions()}
            </StyledSelect>
          )}
          {savingDestination === 'saveToFile' && (
            <StyledSelect
              showSearch
              onChange={(value: any) => setSelectedFile(value)}
              value={selectedFile}
              placeholder="Select a destination file"
            >
              {renderFileSelectOptions()}
            </StyledSelect>
          )}
        </SaveDestinationWrapper>
      </Form>
    </Modal>
  );
};

export default NewResourceWizard;
