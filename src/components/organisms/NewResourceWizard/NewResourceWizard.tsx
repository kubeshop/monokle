import React from 'react';
import {Modal, Form, Input, Select} from 'antd';
import {InfoCircleOutlined} from '@ant-design/icons';
import {useAppSelector, useAppDispatch} from '@redux/hooks';
import {closeNewResourceWizard} from '@redux/reducers/ui';
import {useResetFormOnCloseModal} from '@utils/hooks';
import {createUnsavedResource} from '@redux/services/unsavedResource';
import {ResourceKindHandlers} from '@src/kindhandlers';

const NewResourceWizard = () => {
  const dispatch = useAppDispatch();
  const isNewResourceWizardOpen = useAppSelector(state => state.ui.isNewResourceWizardOpen);

  const [form] = Form.useForm();
  useResetFormOnCloseModal({form, visible: isNewResourceWizardOpen});

  const closeWizard = () => {
    dispatch(closeNewResourceWizard());
  };

  const onOk = () => {
    form.submit();
  };

  const onCancel = () => {
    closeWizard();
  };

  const onFinish = (values: any) => {
    if (!values.name || !values.kind) {
      return;
    }

    createUnsavedResource(
      {
        name: values.name,
        kind: values.kind,
        namespace: values.namespace,
        apiVersion: values.apiVersion,
      },
      dispatch
    );

    closeWizard();
  };

  return (
    <Modal title="Add New Resource" visible={isNewResourceWizardOpen} onOk={onOk} onCancel={onCancel}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
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
          tooltip={{title: 'Enter the apiVersion', icon: <InfoCircleOutlined />}}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="namespace"
          label="Namespace"
          tooltip={{title: 'Select the namespace', icon: <InfoCircleOutlined />}}
        >
          <Select />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NewResourceWizard;
