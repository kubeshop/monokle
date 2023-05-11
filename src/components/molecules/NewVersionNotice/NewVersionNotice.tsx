import {ipcRenderer} from 'electron';

import {useCallback, useEffect, useMemo} from 'react';

import {Tooltip} from 'antd';

import {CloseOutlined as RawCloseOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {setIsNewVersionAvailable, updateNewVersion} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {hideNewVersionNotice, showNewVersionNotice} from '@redux/reducers/ui';

import {NewVersionCode} from '@shared/models/config';
import {Colors} from '@shared/styles/colors';

type IProps = {
  children: React.ReactNode;
};

const NewVersionNotice: React.FC<IProps> = ({children}) => {
  const dispatch = useAppDispatch();
  const newVersion = useAppSelector(state => state.config.newVersion);
  const isNewVersionNoticeVisible = useAppSelector(state => state.ui.newVersionNotice.isVisible);

  const handleInstall = () => {
    ipcRenderer.send('quit-and-install');
  };

  const getErrorMessage = useCallback((code: number) => {
    if (code === -2) {
      return <div>Auto-update is not enabled in development mode!</div>;
    }
    if (code === -10) {
      return <div>Could not get code signature for the running application!</div>;
    }
    return <div>The updating process was unsuccessful due to an error!</div>;
  }, []);

  const content = useMemo(() => {
    if (newVersion.code === NewVersionCode.Downloaded) {
      return (
        <div>
          A new version is available. <RestartButton onClick={handleInstall}>Restart</RestartButton> to enjoy.
        </div>
      );
    }

    if (newVersion.code === NewVersionCode.NotAvailable) {
      return <span>You are already running the latest version of Monokle!</span>;
    }

    if (newVersion.code === NewVersionCode.Errored) {
      return <span>{getErrorMessage(newVersion.data?.errorCode)}</span>;
    }
  }, [getErrorMessage, newVersion.code, newVersion.data?.errorCode]);

  useEffect(() => {
    if (
      (newVersion.code < NewVersionCode.Idle && !newVersion.data?.initial) ||
      newVersion.code === NewVersionCode.Downloaded
    ) {
      dispatch(showNewVersionNotice());

      if (newVersion.code === NewVersionCode.Downloaded) {
        dispatch(setIsNewVersionAvailable(true));
      }
    }
  }, [dispatch, newVersion.code, newVersion.data?.initial]);

  return (
    <Tooltip
      overlayClassName="new-version-notice-tooltip"
      open={isNewVersionNoticeVisible}
      title={
        <TitleContainer>
          {content}
          <CloseOutlined
            onClick={() => {
              dispatch(hideNewVersionNotice());
              if (newVersion.code === NewVersionCode.NotAvailable) {
                dispatch(updateNewVersion({code: NewVersionCode.Idle, data: null}));
              }
            }}
          />
        </TitleContainer>
      }
      placement="right"
    >
      {children}
    </Tooltip>
  );
};

export default NewVersionNotice;

// Styled Components

const CloseOutlined = styled(RawCloseOutlined)`
  color: ${Colors.grey8};
  cursor: pointer;
`;

const RestartButton = styled.span`
  font-weight: 700;
  cursor: pointer;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;
