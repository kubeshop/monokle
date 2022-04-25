import {ipcRenderer} from 'electron';

import React, {useCallback, useMemo} from 'react';

import {Button} from 'antd';

import {CloseOutlined} from '@ant-design/icons';

import {NewVersionCode} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateNewVersion} from '@redux/reducers/appConfig';

import NewUpdate from '@assets/NewUpdate.svg';

import * as S from './styled';

const UpdateNotice = () => {
  const dispatch = useAppDispatch();
  const newVersion = useAppSelector(state => state.config.newVersion);

  const isNoticeVisible = useMemo(
    () =>
      (newVersion.code < NewVersionCode.Idle && !newVersion.data?.initial) ||
      newVersion.code === NewVersionCode.Downloaded,
    [newVersion]
  );

  const getErrorMessage = useCallback((code: number) => {
    if (code === -2) {
      return <div>Auto-update is not enabled in development mode!</div>;
    }
    if (code === -10) {
      return <div>Could not get code signature for running application!</div>;
    }
    return <div>Update process encountered with an error!</div>;
  }, []);

  const handleClose = () => {
    dispatch(updateNewVersion({code: NewVersionCode.Idle, data: null}));
  };

  const handleInstall = () => {
    ipcRenderer.send('quit-and-install');
  };

  if (!isNoticeVisible) {
    return <span />;
  }

  const content = () => {
    if (newVersion.code === NewVersionCode.Downloaded) {
      return (
        <>
          <img src={NewUpdate} alt="new update" />
          <S.NewVersionText>A new version is available!</S.NewVersionText> Restart to fully enjoy it.
          <S.InstallButton type="primary" onClick={handleInstall}>
            Restart
          </S.InstallButton>
        </>
      );
    }

    if (newVersion.code === NewVersionCode.NotAvailable) {
      return <span>New version is not available!</span>;
    }

    if (newVersion.code === NewVersionCode.Errored) {
      return <span>{getErrorMessage(newVersion.data?.errorCode)}</span>;
    }
  };

  return (
    <S.UpdateNoticeContainer>
      {content()}
      <Button type="link" onClick={handleClose}>
        <CloseOutlined />
      </Button>
    </S.UpdateNoticeContainer>
  );
};

export default UpdateNotice;
