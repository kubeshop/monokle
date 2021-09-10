import React from 'react';
import {Modal, Form, Input, Select} from 'antd';
import {InfoCircleOutlined} from '@ant-design/icons';
import {useAppSelector, useAppDispatch} from '@redux/hooks';
import {closeNewResourceWizard} from '@redux/reducers/ui';
import {useResetFormOnCloseModal} from '@utils/hooks';
import {createUnsavedResource} from '@redux/services/unsavedResource';
import {ResourceKindHandlers, getResourceKindHandler} from '@src/kindhandlers';
import {useNamespaces, NO_NAMESPACE} from '@hooks/useNamespaces';

const SELECT_OPTION_NONE = '<none>';

const NewResourceWizard = () => {
  const dispatch = useAppDispatch();
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const newResourceWizardState = useAppSelector(state => state.ui.newResourceWizard);
  const namespaces = useNamespaces({extra: ['none', 'default']});

  const defaultInput = newResourceWizardState.defaultInput;
  const defaultValues = defaultInput
    ? {
        ...defaultInput,
        namespace: defaultInput.namespace || SELECT_OPTION_NONE,
        selectedResourceId: defaultInput.selectedResourceId || SELECT_OPTION_NONE,
      }
    : undefined;
  const [form] = Form.useForm();
  useResetFormOnCloseModal({form, visible: newResourceWizardState.isOpen, defaultValues});

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
    if (data.kind) {
      const kindHandler = getResourceKindHandler(data.kind);
      if (kindHandler) {
        form.setFieldsValue({
          apiVersion: kindHandler.clusterApiVersion,
        });
      }
    }
  };

  const onFinish = (data: any) => {
    if (!data.name || !data.kind) {
      return;
    }

    const selectedResource =
      data.selectedResourceId && data.selectedResourceId !== SELECT_OPTION_NONE
        ? resourceMap[data.selectedResourceId]
        : undefined;
    const jsonTemplate = selectedResource?.content;

    createUnsavedResource(
      {
        name: data.name,
        kind: data.kind,
        namespace: data.namespace === NO_NAMESPACE ? undefined : data.namespace,
        apiVersion: data.apiVersion,
      },
      dispatch,
      jsonTemplate
    );

    closeWizard();
  };

  return (
    <Modal title="Add New Resource" visible={newResourceWizardState.isOpen} onOk={onOk} onCancel={onCancel}>
      <Form form={form} layout="vertical" onValuesChange={onFormValuesChange} onFinish={onFinish}>
        <Form.Item name="name" label="Name" required>
          <Input />
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
          tooltip={{title: 'Select the namespace', icon: <InfoCircleOutlined />}}
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
            {Object.values(resourceMap).map(resource => (
              <Select.Option key={resource.id} value={resource.id}>
                {resource.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NewResourceWizard;
