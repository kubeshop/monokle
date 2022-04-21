import {useEffect, useRef, useState} from 'react';

import {Checkbox, Form, Input, Modal} from 'antd';

import styled from 'styled-components';

import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeRenameResourceModal} from '@redux/reducers/ui';
import {renameResource} from '@redux/thunks/renameResource';

const CheckboxContainer = styled.div`
  margin-top: 10px;
`;

const RenameResourceModel: React.FC = () => {
  const dispatch = useAppDispatch();
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const uiState = useAppSelector(state => state.ui.renameResourceModal);

  const [newResourceName, setNewResourceName] = useState<string>();
  const [resource, setResource] = useState<K8sResource>();
  const [shouldUpdateRefs, setShouldUpdateRefs] = useState<boolean>(false);
  const [isButtonDisabled, setButtonDisabled] = useState<boolean>(false);

  const [form] = Form.useForm();
  const inputNameRef = useRef<any>();

  useEffect(() => {
    if (uiState) {
      const newResource = resourceMap[uiState.resourceId];
      if (newResource) {
        setResource(newResource);
        setNewResourceName(newResource.name);
      }
    }
    if (!uiState || uiState?.isOpen === false) {
      setResource(undefined);
      setNewResourceName(undefined);
    }
    setShouldUpdateRefs(false);
    inputNameRef?.current?.focus();
  }, [uiState, resourceMap]);

  if (!uiState || !resource) {
    return null;
  }

  const handleOk = () => {
    if (!newResourceName || resource.name === newResourceName) {
      return;
    }
    renameResource(resource.id, newResourceName, shouldUpdateRefs, resourceMap, dispatch, selectedResourceId);
    dispatch(closeRenameResourceModal());
  };

  const handleCancel = () => {
    dispatch(closeRenameResourceModal());
  };

  return (
    <Modal
      title={`Rename resource - ${resource.name}`}
      visible={uiState.isOpen}
      onOk={handleOk}
      okButtonProps={{disabled: isButtonDisabled}}
      onCancel={handleCancel}
    >
      <Form
        form={form}
        layout="vertical"
        onFieldsChange={() => setButtonDisabled(form.getFieldsError().some(field => field.errors.length > 0))}
      >
        <Form.Item
          name="name"
          label="New Resource Name"
          rules={[
            {required: true, message: 'This field is required'},
            {pattern: /^[a-z0-9]$|^([a-z0-9\-.])*[a-z0-9]$/, message: 'Wrong pattern'},
            {max: 63, type: 'string', message: 'Too long'},
          ]}
        >
          <Input
            id="resource-name-input"
            placeholder="Enter resource name"
            ref={inputNameRef}
            defaultValue={newResourceName}
            onChange={e => setNewResourceName(e.target.value)}
          />
        </Form.Item>
        <CheckboxContainer>
          <Checkbox
            checked={shouldUpdateRefs}
            onChange={e => {
              setShouldUpdateRefs(e.target.checked);
            }}
          >
            Automatically update references to this resource
          </Checkbox>
        </CheckboxContainer>
      </Form>
    </Modal>
  );
};

export default RenameResourceModel;
