import {useEffect, useState, useCallback} from 'react';
import {Button, Modal} from 'antd';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateNewVersion} from '@redux/reducers/appConfig';
import {NewVersionCode} from '@models/appconfig';
import {ipcRenderer} from 'electron';
import styled from 'styled-components';

const StyledModal = styled(Modal)`
  .ant-modal {
    z-index: 1000;
  }
`;

const UpdateModal = () => {
  const dispatch = useAppDispatch();
  const newVersion = useAppSelector(state => state.config.newVersion);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleClose = () => {
    dispatch(updateNewVersion({code: NewVersionCode.Idle, data: null}));
  };

  const handleInstall = () => {
    ipcRenderer.send('quit-and-install');
  };

  useEffect(() => {
    if (
      (newVersion.code < NewVersionCode.Idle && !newVersion.data?.initial) ||
      newVersion.code === NewVersionCode.Downloaded
    ) {
      setIsModalVisible(true);
    } else {
      setIsModalVisible(false);
    }
  }, [newVersion]);

  const getErrorMessage = useCallback(
    (code: number) => {
      if (code === -2) {
        return <div>Auto-update is not enabled in development mode!</div>;
      }
      if (code === -10) {
        return <div>Could not get code signature for running application!</div>;
      }
      return <div>Update process encountered with an error!</div>;
    },
    [newVersion]
  );

  return (
    <StyledModal
      visible={isModalVisible}
      title="Update Monokle 🚀"
      centered
      width={400}
      onCancel={handleClose}
      footer={
        newVersion.code === NewVersionCode.Downloaded ? (
          <Button style={{width: 72}} type="primary" onClick={handleInstall}>
            Install
          </Button>
        ) : (
          <Button style={{width: 72}} type="primary" onClick={handleClose}>
            Ok
          </Button>
        )
      }
    >
      {newVersion.code === NewVersionCode.Errored ? getErrorMessage(newVersion.data?.errorCode) : null}
      {newVersion.code === NewVersionCode.NotAvailable ? <div>New version is not available!</div> : null}
      {newVersion.code === NewVersionCode.Downloaded ? <div>New version is downloaded!</div> : null}
    </StyledModal>
  );
};

export default UpdateModal;
