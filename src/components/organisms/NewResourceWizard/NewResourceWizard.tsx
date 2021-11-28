import {useEffect, useMemo, useRef, useState} from 'react';

import {Form, Input, Modal, Select} from 'antd';

import {InfoCircleOutlined} from '@ant-design/icons';

import path from 'path/posix';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeNewResourceWizard} from '@redux/reducers/ui';
import {createUnsavedResource} from '@redux/services/unsavedResource';
import {saveUnsavedResource} from '@redux/thunks/saveUnsavedResource';

import {NO_NAMESPACE, useNamespaces} from '@hooks/useNamespaces';

import {useResetFormOnCloseModal} from '@utils/hooks';
import {openNamespaceTopic, openUniqueObjectNameTopic} from '@utils/shell';

import {ResourceKindHandlers, getResourceKindHandler} from '@src/kindhandlers';

import {SaveToFolderWrapper, StyledCheckbox, StyledSelect} from './NewResourceWizard.styled';

const SELECT_OPTION_NONE = '<none>';

const {Option} = Select;

const NewResourceWizard = () => {
  const dispatch = useAppDispatch();
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const newResourceWizardState = useAppSelector(state => state.ui.newResourceWizard);
  const namespaces = useNamespaces({extra: ['none', 'default']});
  const [filteredResources, setFilteredResources] = useState<K8sResource[]>([]);
  const [shouldSaveToFolder, setShouldSaveState] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState(ROOT_FILE_ENTRY);
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
      setSelectedFolder(defaultInput.targetFolder);
    }
  }, [defaultInput]);

  const closeWizard = () => {
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

    const fullFileName = getFullFileName(formValues.name);

    if (shouldSaveToFolder) {
      setTimeout(() => {
        dispatch(
          saveUnsavedResource({
            resourceId: newResource.id,
            absolutePath:
              selectedFolder === ROOT_FILE_ENTRY
                ? path.join(fileMap[ROOT_FILE_ENTRY].filePath, path.sep, fullFileName)
                : path.join(fileMap[ROOT_FILE_ENTRY].filePath, selectedFolder, path.sep, fullFileName),
          })
        );
      }, 500);
    }

    closeWizard();
  };

  const foldersList = useMemo(
    () =>
      Object.entries(fileMap)
        .map(([key, value]) => ({folderName: key.replace(path.sep, ''), isFolder: Boolean(value.children)}))
        .filter(file => file.isFolder),
    [fileMap]
  );

  const renderSelectOptions = () => {
    return foldersList.map(folder => (
      <Option key={folder.folderName} value={folder.folderName}>
        {folder.folderName}
      </Option>
    ));
  };

  return (
    <Modal title="Add New Resource" visible={newResourceWizardState.isOpen} onOk={onOk} onCancel={onCancel}>
      <Form form={form} layout="vertical" onValuesChange={onFormValuesChange} onFinish={onFinish}>
        <Form.Item
          name="name"
          label="Name"
          rules={[
            {required: true, message: 'This field is required'},
            {pattern: /^[a-z]$|^([a-z\-.])*[a-z]$/, message: 'Wrong pattern'},
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
          <Input maxLength={63} />
        </Form.Item>
        <Form.Item
          name="kind"
          label="Kind"
          required
          tooltip={{title: 'Select the resource kind', icon: <InfoCircleOutlined />}}
        >
          <Select showSearch>
            {ResourceKindHandlers.map(kindHandler => (
              <Select.Option key={kindHandler.kind} value={kindHandler.kind}>
                {kindHandler.kind}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="apiVersion"
          label="API Version"
          required
          tooltip={{title: 'Enter the apiVersion', icon: <InfoCircleOutlined />}}
        >
          <Input />
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
          <Select>
            {namespaces.map(namespace => (
              <Select.Option key={namespace} value={namespace}>
                {namespace}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="selectedResourceId"
          label="Select existing resource as template"
          initialValue={SELECT_OPTION_NONE}
        >
          <Select showSearch>
            <Select.Option key={SELECT_OPTION_NONE} value={SELECT_OPTION_NONE}>
              {SELECT_OPTION_NONE}
            </Select.Option>
            {filteredResources.map(resource => (
              <Select.Option key={resource.id} value={resource.id}>
                {resource.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        {fileMap[ROOT_FILE_ENTRY] ? (
          <SaveToFolderWrapper>
            <StyledCheckbox onChange={e => setShouldSaveState(e.target.checked)} checked={shouldSaveToFolder}>
              Save to folder
            </StyledCheckbox>
            <StyledSelect
              showSearch
              disabled={!shouldSaveToFolder}
              onChange={(value: any) => setSelectedFolder(value)}
              value={selectedFolder}
            >
              {renderSelectOptions()}
            </StyledSelect>
          </SaveToFolderWrapper>
        ) : null}
      </Form>
    </Modal>
  );
};

export default NewResourceWizard;
