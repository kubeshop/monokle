import React from 'react';
import {Modal, Form, Input, Select} from 'antd';
import {InfoCircleOutlined} from '@ant-design/icons';
import {useAppSelector, useAppDispatch} from '@redux/hooks';
import {closeNewResourceWizard} from '@redux/reducers/ui';

const NewResourceWizard = () => {
  const dispatch = useAppDispatch();
  const isNewResourceWizardOpen = useAppSelector(state => state.ui.isNewResourceWizardOpen);

  const onCancel = () => {
    dispatch(closeNewResourceWizard());
  };

  return (
    <Modal title="Add New Resource" visible={isNewResourceWizardOpen} onCancel={onCancel}>
      <Form layout="vertical">
        <Form.Item label="Name" required>
          <Input />
        </Form.Item>
        <Form.Item label="Kind" required tooltip={{title: 'Select the resource kind', icon: <InfoCircleOutlined />}}>
          <Select />
        </Form.Item>
        <Form.Item label="Version" tooltip={{title: 'Enter the version', icon: <InfoCircleOutlined />}}>
          <Input />
        </Form.Item>
        <Form.Item label="Namespace" tooltip={{title: 'Select the namespace', icon: <InfoCircleOutlined />}}>
          <Select />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NewResourceWizard;
