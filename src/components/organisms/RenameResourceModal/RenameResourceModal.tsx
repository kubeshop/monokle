import {useEffect, useRef, useState} from 'react';

import {Checkbox, Form, Input, Modal} from 'antd';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeRenameResourceModal} from '@redux/reducers/ui';
import {resourceMapSelector} from '@redux/selectors/resourceMapSelectors';
import {isResourceSelected} from '@redux/services/resource';
import {renameResource} from '@redux/thunks/renameResource';

import {K8sResource} from '@shared/models/k8sResource';

const CheckboxContainer = styled.div`
  margin-top: 10px;
`;

const RenameResourceModel: React.FC = () => {
  const dispatch = useAppDispatch();
  const {isOpen, resourceIdentifier} = useAppSelector(
    state => state.ui.renameResourceModal || {isOpen: undefined, resourceIdentifier: undefined}
  );

  const resourceMap = useAppSelector(state =>
    resourceIdentifier ? resourceMapSelector(state, resourceIdentifier.storage) : undefined
  );
  const isThisResourceSelected = useAppSelector(state =>
    resourceIdentifier ? isResourceSelected(resourceIdentifier, state.main.selection) : undefined
  );
  const [newResourceName, setNewResourceName] = useState<string>();
  const [resource, setResource] = useState<K8sResource>();
  const [shouldUpdateRefs, setShouldUpdateRefs] = useState<boolean>(false);
  const [isButtonDisabled, setButtonDisabled] = useState<boolean>(false);

  const [form] = Form.useForm();
  const inputNameRef = useRef<any>();

  useEffect(() => {
    if (resourceIdentifier && resourceMap) {
      const newResource = resourceMap[resourceIdentifier.id];
      if (newResource) {
        setResource(newResource);
        setNewResourceName(newResource.name);
      }
    }
    if (!resourceIdentifier || isOpen === false) {
      setResource(undefined);
      setNewResourceName(undefined);
    }
    setShouldUpdateRefs(false);
    inputNameRef?.current?.focus();
  }, [resourceIdentifier, isOpen, resourceMap]);

  if (!resource || !resourceIdentifier || !resourceMap) {
    return null;
  }

  const handleOk = () => {
    if (!newResourceName || resource.name === newResourceName) {
      return;
    }
    renameResource(resource, newResourceName, shouldUpdateRefs, resourceMap, dispatch, isThisResourceSelected);
    dispatch(closeRenameResourceModal());
  };

  const handleCancel = () => {
    dispatch(closeRenameResourceModal());
  };

  return (
    <Modal
      title={`Rename resource - ${resource.name}`}
      open={isOpen}
      onOk={handleOk}
      okButtonProps={{disabled: isButtonDisabled}}
      onCancel={handleCancel}
    >
      <Form
        initialValues={{name: newResourceName}}
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
