import {ipcRenderer} from 'electron';

import React, {useCallback, useEffect} from 'react';

// import {useSelector} from 'react-redux';//see what we have
// import {Button, Tooltip} from 'antd';
// import {ExclamationCircleOutlined, FileOutlined, FolderOutlined, ReloadOutlined} from '@ant-design/icons';
import log from 'loglevel';

// import path from 'path';
// import {DEFAULT_PANE_TITLE_HEIGHT, ROOT_FILE_ENTRY, TOOLTIP_DELAY} from '@constants/constants';
// import {CollapseTreeTooltip, ExpandTreeTooltip, FileExplorerChanged, ReloadFolderTooltip} from '@constants/tooltips';
import {useAppDispatch} from '@redux/hooks';
// import {setSelectingFile} from '@redux/reducers/main';
// import {openCreateFileFolderModal, setExpandedFolders} from '@redux/reducers/ui';
// import {isInPreviewModeSelector, settingsSelector} from '@redux/selectors';
// import {isHelmChartFile, isHelmTemplateFile, isHelmValuesFile} from '@redux/services/helm';
// import {isKustomizationFilePath} from '@redux/services/kustomize';
import {setRootFolder} from '@redux/thunks/setRootFolder';

// import {TitleBar} from '@molecules';

// import {Icon} from '@atoms';

// import {
//   useCreate,
//   useDelete,
//   useDuplicate,
//   useFileSelect,
//   useFilterByFileOrFolder,
//   useHighlightNode,
//   usePreview,
//   useProcessing,
//   useRename,
// } from '@hooks/fileTreeHooks';

// import {createNode} from './CreateNode';
// import TreeItem from './TreeItem';
// import {TreeNode} from './types';
// import * as S from './styled';

type Props = {
  height: number;
};

const GettingStarted: React.FC<Props> = ({height}) => {
  const dispatch = useAppDispatch();
  const h = height;
  console.log(h, 'height');

  const onSelectRootFolderFromMainThread = useCallback(
    (_: any, data: string) => {
      if (data) {
        log.info('setting root folder from main thread', data);
        setFolder(data);
      }
    },
    [setFolder]
  );

  const setFolder = useCallback(
    (folder: string) => {
      dispatch(setRootFolder(folder));
    },
    [dispatch]
  );

  // called from main thread because thunks cannot be dispatched by main
  useEffect(() => {
    ipcRenderer.on('set-root-folder', onSelectRootFolderFromMainThread);
    return () => {
      ipcRenderer.removeListener('set-root-folder', onSelectRootFolderFromMainThread);
    };
  }, [onSelectRootFolderFromMainThread]);
};

export default GettingStarted;
