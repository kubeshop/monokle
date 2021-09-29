import {useEffect, useState} from 'react';
import {Button, Modal} from 'antd';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateNewVersion} from '@redux/reducers/appConfig';
import {NewVersion} from '@models/appconfig';
import {ipcRenderer} from 'electron';

const UpdateModal = () => {
  const dispatch = useAppDispatch();
  const newVersion = useAppSelector(state => state.config.newVersion);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleClose = () => {
    dispatch(updateNewVersion(NewVersion.Idle));
  };

  const handleInstall = () => {
    dispatch(updateNewVersion(NewVersion.Idle));
    ipcRenderer.send('quit-and-install');
  };

  useEffect(() => {
    if (newVersion < NewVersion.Idle || newVersion === NewVersion.Downloaded) {
      setIsModalVisible(true);
    } else {
      setIsModalVisible(false);
    }
  }, [newVersion]);

  return (
    <Modal
      visible={isModalVisible}
      title="Update Monokle 🚀"
      centered
      width={400}
      onCancel={handleClose}
      footer={
        newVersion === NewVersion.Downloaded ? (
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
      {newVersion === NewVersion.Errored ? <div>Update process encountered with an error!</div> : null}
      {newVersion === NewVersion.NotAvailable ? <div>New version is not available!</div> : null}
      {newVersion === NewVersion.Downloaded ? <div>New version is downloaded!</div> : null}
    </Modal>
  );
};

export default UpdateModal;
