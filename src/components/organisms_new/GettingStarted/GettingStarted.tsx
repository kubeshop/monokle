import {ipcRenderer} from 'electron';

import React, {useCallback, useEffect} from 'react';
import {useMeasure} from 'react-use';

// import {useSelector} from 'react-redux';//see what we have
// import {Button, Tooltip} from 'antd';
// import {ExclamationCircleOutlined, FileOutlined, FolderOutlined, ReloadOutlined} from '@ant-design/icons';
import log from 'loglevel';

import {useAppDispatch} from '@redux/hooks';
// import {setSelectingFile} from '@redux/reducers/main';
// import {openCreateFileFolderModal, setExpandedFolders} from '@redux/reducers/ui';
// import {isInPreviewModeSelector, settingsSelector} from '@redux/selectors';
// import {isHelmChartFile, isHelmTemplateFile, isHelmValuesFile} from '@redux/services/helm';
// import {isKustomizationFilePath} from '@redux/services/kustomize';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import * as S from './GettingStarted.styled';

const [gettingStartedRef, {}] = useMeasure<HTMLDivElement>();

const GettingStarted: React.FC = () => {
  const dispatch = useAppDispatch();

  const setFolder = useCallback(
    (folder: string) => {
      dispatch(setRootFolder(folder));
    },
    [dispatch]
  );

  return <S.NavigatorPaneContainer ref={gettingStartedRef}>Hello World</S.NavigatorPaneContainer>;
};

export default GettingStarted;
