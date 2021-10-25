import React, {useState, useEffect, useRef} from 'react';
import {Modal, Input, Checkbox} from 'antd';
import {useAppSelector, useAppDispatch} from '@redux/hooks';
import {closeRenameResourceModal} from '@redux/reducers/ui';
import {renameResource} from '@redux/services/renameResource';
import styled from 'styled-components';
import {K8sResource} from '@models/k8sresource';

const CheckboxContainer = styled.div`
  margin-top: 10px;
`;

const RenameResourceModel = () => {
  const dispatch = useAppDispatch();
  const uiState = useAppSelector(state => state.ui.renameResourceModal);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const [newResourceName, setNewResourceName] = useState<string>();
  const [shouldUpdateRefs, setShouldUpdateRefs] = useState<boolean>(false);
  const inputNameRef = useRef<any>();
  const [resource, setResource] = useState<K8sResource>();

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

  if (!uiState) {
    return null;
  }

  if (!resource) {
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
      onCancel={handleCancel}
    >
      <span>New resource name:</span>
      <Input ref={inputNameRef} defaultValue={newResourceName} onChange={e => setNewResourceName(e.target.value)} />
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
    </Modal>
  );
};

export default RenameResourceModel;
