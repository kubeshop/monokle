import React, {useState, useEffect, useRef} from 'react';
import {Modal, Input, Checkbox} from 'antd';
import {useAppSelector, useAppDispatch} from '@redux/hooks';
import {closeRenameResourceModal} from '@redux/reducers/ui';
import {renameResource} from '@redux/services/renameResource';
import styled from 'styled-components';

const CheckboxContainer = styled.div`
  margin-top: 10px;
`;

const RenameResourceModel = () => {
  const dispatch = useAppDispatch();
  const uiState = useAppSelector(state => state.ui.renameResourceModal);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const [newResourceName, setNewResourceName] = useState<string>();
  const [shouldUpdateRefs, setShouldUpdateRefs] = useState<boolean>(false);
  const inputNameRef = useRef<any>();

  useEffect(() => {
    if (uiState?.isOpen) {
      setNewResourceName(undefined);
      setShouldUpdateRefs(false);
      inputNameRef?.current?.focus();
    }
  }, [uiState?.isOpen]);

  if (!uiState) {
    return null;
  }

  const resource = resourceMap[uiState.resourceId];

  if (!resource) {
    return null;
  }

  const handleOk = () => {
    if (!newResourceName || resource.name === newResourceName) {
      return;
    }
    renameResource(resource.id, newResourceName, shouldUpdateRefs, resourceMap, dispatch);
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
      <label>New resource name:</label>
      <Input ref={inputNameRef} value={newResourceName} onChange={e => setNewResourceName(e.target.value)} />
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
