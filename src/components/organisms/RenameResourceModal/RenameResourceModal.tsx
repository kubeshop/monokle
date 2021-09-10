import React, {useState, useEffect} from 'react';
import {Modal, Input, Checkbox} from 'antd';
import {useAppSelector, useAppDispatch} from '@redux/hooks';
import {closeRenameResourceModal} from '@redux/reducers/ui';
import {renameResource} from '@redux/services/renameResource';

const RenameResourceModel = () => {
  const dispatch = useAppDispatch();
  const uiState = useAppSelector(state => state.ui.renameResourceModal);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const [newResourceName, setNewResourceName] = useState<string>();
  const [shouldUpdateRefs, setShouldUpdateRefs] = useState<boolean>(false);

  useEffect(() => {
    if (uiState?.isOpen) {
      setNewResourceName(undefined);
      setShouldUpdateRefs(false);
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
      <Input value={newResourceName} onChange={e => setNewResourceName(e.target.value)} />
      <Checkbox
        checked={shouldUpdateRefs}
        onChange={e => {
          setShouldUpdateRefs(e.target.checked);
        }}
      >
        Automatically update references to this resource
      </Checkbox>
    </Modal>
  );
};

export default RenameResourceModel;
