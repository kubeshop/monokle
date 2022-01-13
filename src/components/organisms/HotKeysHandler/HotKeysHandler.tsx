import React, {useCallback, useMemo, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import {useSelector} from 'react-redux';

import {ROOT_FILE_ENTRY} from '@constants/constants';
import hotkeys from '@constants/hotkeys';
import {makeApplyKustomizationText, makeApplyResourceText} from '@constants/makeApplyText';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openResourceDiffModal, updateResourceFilter} from '@redux/reducers/main';
import {
  openNewResourceWizard,
  openQuickSearchActionsPopup,
  setLeftMenuSelection,
  toggleLeftMenu,
  toggleRightMenu,
  toggleSettings,
} from '@redux/reducers/ui';
import {currentConfigSelector, isInPreviewModeSelector} from '@redux/selectors';
import {applyFileWithConfirm} from '@redux/services/applyFileWithConfirm';
import {isKustomizationResource} from '@redux/services/kustomize';
import {startPreview, stopPreview} from '@redux/services/preview';
import {applyResource} from '@redux/thunks/applyResource';
import {selectFromHistory} from '@redux/thunks/selectionHistory';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import FileExplorer from '@atoms/FileExplorer';

import ModalConfirmWithNamespaceSelect from '@components/molecules/ModalConfirmWithNamespaceSelect';

import {useFileExplorer} from '@hooks/useFileExplorer';

import featureJson from '@src/feature-flags.json';

const HotKeysHandler = () => {
  const dispatch = useAppDispatch();
  const mainState = useAppSelector(state => state.main);
  // const configState = useAppSelector(state => state.config);
  const uiState = useAppSelector(state => state.ui);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const currentConfig = useSelector(currentConfigSelector);

  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);

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
      setIsApplyModalVisible(true);
    } else if (mainState.selectedPath) {
      applyFileWithConfirm(
        mainState.selectedPath,
        mainState.fileMap,
        dispatch,
        String(currentConfig.kubeConfig?.path),
        currentConfig.kubeConfig?.currentContext || ''
      );
    }
  }, [
    mainState.selectedResourceId,
    mainState.resourceMap,
    mainState.fileMap,
    currentConfig.kubeConfig?.path,
    currentConfig.kubeConfig?.currentContext,
    mainState.selectedPath,
    dispatch,
  ]);

  const applySelectedResource = useMemo(() => {
    if (!mainState.selectedResourceId) {
      return [];
    }
    const resource = mainState.resourceMap[mainState.selectedResourceId];
    return resource ? [resource] : [];
  }, [mainState.resourceMap, mainState.selectedResourceId]);

  const onClickApplyResource = (namespace?: string) => {
    if (!mainState.selectedResourceId) {
      setIsApplyModalVisible(false);
      return;
    }
    const selectedResource = mainState.resourceMap[mainState.selectedResourceId];

    if (!selectedResource) {
      setIsApplyModalVisible(false);
      return;
    }

    const isClusterPreview = mainState.previewType === 'cluster';

    const kustomizeCommand = currentConfig.settings?.kustomizeCommand;

    applyResource(
      selectedResource.id,
      mainState.resourceMap,
      mainState.fileMap,
      dispatch,
      String(currentConfig.kubeConfig?.path),
      currentConfig.kubeConfig?.currentContext || '',
      namespace,
      {
        isClusterPreview,
        kustomizeCommand,
      }
    );
    setIsApplyModalVisible(false);
  };

  const confirmModalTitle = useMemo(() => {
    if (!mainState.selectedResourceId) {
      return '';
    }
    const selectedResource = mainState.resourceMap[mainState.selectedResourceId];

    if (!selectedResource) {
      return '';
    }

    return isKustomizationResource(selectedResource)
      ? makeApplyKustomizationText(selectedResource.name, currentConfig.kubeConfig?.currentContext)
      : makeApplyResourceText(selectedResource.name, currentConfig.kubeConfig?.currentContext);
  }, [mainState.resourceMap, mainState.selectedResourceId, currentConfig.kubeConfig?.currentContext]);

  useHotkeys(
    hotkeys.APPLY_SELECTION,
    () => {
      applySelection();
    },
    [applySelection]
  );

  const diffSelectedResource = useCallback(() => {
    if (mainState.selectedResourceId) {
      dispatch(openResourceDiffModal(mainState.selectedResourceId));
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
      startPreview(String(currentConfig.kubeConfig?.path), 'cluster', dispatch);
    },
    [currentConfig.kubeConfig]
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
    if (featureJson.ShowRightMenu) {
      dispatch(toggleRightMenu());
    }
  });

  useHotkeys(hotkeys.SELECT_FROM_HISTORY_BACK, () => {
    selectFromHistory(
      'left',
      mainState.currentSelectionHistoryIndex,
      mainState.selectionHistory,
      mainState.resourceMap,
      mainState.fileMap,
      dispatch
    );
  });

  useHotkeys(hotkeys.SELECT_FROM_HISTORY_FORWARD, () => {
    selectFromHistory(
      'right',
      mainState.currentSelectionHistoryIndex,
      mainState.selectionHistory,
      mainState.resourceMap,
      mainState.fileMap,
      dispatch
    );
  });

  useHotkeys(
    hotkeys.OPEN_NEW_RESOURCE_WIZARD,
    () => {
      if (!uiState.newResourceWizard.isOpen && mainState.fileMap[ROOT_FILE_ENTRY]) {
        dispatch(openNewResourceWizard());
      }
    },
    [mainState.fileMap[ROOT_FILE_ENTRY]]
  );

  useHotkeys(hotkeys.OPEN_EXPLORER_TAB, () => {
    dispatch(setLeftMenuSelection('file-explorer'));
  });

  useHotkeys(hotkeys.OPEN_KUSTOMIZATION_TAB, () => {
    dispatch(setLeftMenuSelection('kustomize-pane'));
  });

  useHotkeys(hotkeys.OPEN_HELM_TAB, () => {
    dispatch(setLeftMenuSelection('helm-pane'));
  });

  useHotkeys(hotkeys.RESET_RESOURCE_FILTERS, () => {
    dispatch(updateResourceFilter({labels: {}, annotations: {}}));
  });

  useHotkeys(
    hotkeys.OPEN_QUICK_SEARCH,
    () => {
      if (!uiState.quickSearchActionsPopup.isOpen) {
        dispatch(openQuickSearchActionsPopup());
      }
    },
    [uiState.quickSearchActionsPopup.isOpen]
  );

  return (
    <>
      <FileExplorer {...fileExplorerProps} />

      {isApplyModalVisible && (
        <ModalConfirmWithNamespaceSelect
          isVisible={isApplyModalVisible}
          resources={applySelectedResource}
          title={confirmModalTitle}
          onOk={selectedNamespace => onClickApplyResource(selectedNamespace)}
          onCancel={() => setIsApplyModalVisible(false)}
        />
      )}
    </>
  );
};

export default HotKeysHandler;
