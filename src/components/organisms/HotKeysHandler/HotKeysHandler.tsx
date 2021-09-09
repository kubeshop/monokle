import React, {useCallback} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import hotkeys from '@constants/hotkeys';
import {useSelector} from 'react-redux';
import {ROOT_FILE_ENTRY} from '@constants/constants';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {isInPreviewModeSelector} from '@redux/selectors';
import {toggleSettings, toggleLeftMenu, toggleRightMenu, openNewResourceWizard} from '@redux/reducers/ui';
import {startPreview, stopPreview} from '@redux/services/preview';
import {setRootFolder} from '@redux/thunks/setRootFolder';
import {selectFromHistory} from '@redux/thunks/selectionHistory';
import FileExplorer from '@atoms/FileExplorer';
import {useFileExplorer} from '@hooks/useFileExplorer';
import {applyResourceWithConfirm} from '@redux/services/applyResourceWithConfirm';
import {applyFileWithConfirm} from '@redux/services/applyFileWithConfirm';
import {performResourceDiff} from '@redux/thunks/diffResource';

const HotKeysHandler = () => {
  const dispatch = useAppDispatch();
  const mainState = useAppSelector(state => state.main);
  const configState = useAppSelector(state => state.config);
  const uiState = useAppSelector(state => state.ui);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (!folderPath) {
        return;
      }
      dispatch(setRootFolder(folderPath));
    },
    {
      isDirectoryExplorer: true,
    }
  );

  useHotkeys(hotkeys.SELECT_FOLDER, () => {
    openFileExplorer();
  });

  useHotkeys(
    hotkeys.REFRESH_FOLDER,
    () => {
      if (mainState.fileMap && mainState.fileMap[ROOT_FILE_ENTRY] && mainState.fileMap[ROOT_FILE_ENTRY].filePath) {
        dispatch(setRootFolder(mainState.fileMap[ROOT_FILE_ENTRY].filePath));
      }
    },
    [mainState]
  );

  useHotkeys(hotkeys.TOGGLE_SETTINGS, () => {
    dispatch(toggleSettings());
  });

  const applySelection = useCallback(() => {
    if (!mainState.selectedResourceId) {
      return;
    }
    const selectedResource = mainState.resourceMap[mainState.selectedResourceId];
    if (selectedResource) {
      const isClusterPreview = mainState.previewType === 'cluster';
      applyResourceWithConfirm(
        selectedResource,
        mainState.resourceMap,
        mainState.fileMap,
        dispatch,
        configState.kubeconfigPath,
        {isClusterPreview}
      );
    } else if (mainState.selectedPath) {
      applyFileWithConfirm(mainState.selectedPath, mainState.fileMap, dispatch, configState.kubeconfigPath);
    }
  }, [
    mainState.selectedResourceId,
    mainState.resourceMap,
    mainState.fileMap,
    configState.kubeconfigPath,
    mainState.selectedPath,
    mainState.previewType,
    dispatch,
  ]);

  useHotkeys(
    hotkeys.APPLY_SELECTION,
    () => {
      applySelection();
    },
    [applySelection]
  );

  const diffSelectedResource = useCallback(() => {
    if (mainState.selectedResourceId) {
      dispatch(performResourceDiff(mainState.selectedResourceId));
    }
  }, [mainState.selectedResourceId, dispatch]);

  useHotkeys(
    hotkeys.DIFF_RESOURCE,
    () => {
      diffSelectedResource();
    },
    [diffSelectedResource]
  );

  useHotkeys(
    hotkeys.PREVIEW_CLUSTER,
    () => {
      startPreview(configState.kubeconfigPath, 'cluster', dispatch);
    },
    [configState]
  );

  useHotkeys(
    hotkeys.EXIT_PREVIEW_MODE,
    () => {
      if (isInPreviewMode) {
        stopPreview(dispatch);
      }
    },
    [isInPreviewMode]
  );

  useHotkeys(hotkeys.TOGGLE_LEFT_PANE, () => {
    dispatch(toggleLeftMenu());
  });

  useHotkeys(hotkeys.TOGGLE_RIGHT_PANE, () => {
    dispatch(toggleRightMenu());
  });

  useHotkeys(hotkeys.SELECT_FROM_HISTORY_BACK, () => {
    dispatch(selectFromHistory({direction: 'left'}));
  });

  useHotkeys(hotkeys.SELECT_FROM_HISTORY_FORWARD, () => {
    dispatch(selectFromHistory({direction: 'right'}));
  });

  useHotkeys(
    hotkeys.OPEN_NEW_RESOURCE_WIZARD,
    () => {
      if (!uiState.isNewResourceWizardOpen && mainState.fileMap[ROOT_FILE_ENTRY]) {
        dispatch(openNewResourceWizard());
      }
    },
    [mainState.fileMap[ROOT_FILE_ENTRY]]
  );

  return (
    <>
      <FileExplorer {...fileExplorerProps} />
    </>
  );
};

export default HotKeysHandler;
