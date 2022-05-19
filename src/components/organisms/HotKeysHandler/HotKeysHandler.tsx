import {useCallback, useMemo, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import {useSelector} from 'react-redux';

import {ROOT_FILE_ENTRY} from '@constants/constants';
import hotkeys from '@constants/hotkeys';
import {makeApplyKustomizationText, makeApplyResourceText} from '@constants/makeApplyText';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openResourceDiffModal, resetResourceFilter} from '@redux/reducers/main';
import {
  openNewResourceWizard,
  openQuickSearchActionsPopup,
  setLeftMenuSelection,
  toggleRightMenu,
  toggleSettings,
  toggleStartProjectPane,
  toggleValidationDrawer,
} from '@redux/reducers/ui';
import {
  currentConfigSelector,
  isInPreviewModeSelector,
  kubeConfigContextSelector,
  kubeConfigPathSelector,
} from '@redux/selectors';
import {isKustomizationResource} from '@redux/services/kustomize';
import {startPreview, stopPreview} from '@redux/services/preview';
import {applyFileWithConfirm} from '@redux/support/applyFileWithConfirm';
import {applyResource} from '@redux/thunks/applyResource';
import {selectFromHistory} from '@redux/thunks/selectionHistory';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import FileExplorer from '@atoms/FileExplorer';

import ModalConfirmWithNamespaceSelect from '@components/molecules/ModalConfirmWithNamespaceSelect';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {useFeatureFlags} from '@utils/features';

const HotKeysHandler = () => {
  const {ShowRightMenu} = useFeatureFlags();
  const dispatch = useAppDispatch();
  const mainState = useAppSelector(state => state.main);
  const uiState = useAppSelector(state => state.ui);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const projectConfig = useAppSelector(currentConfigSelector);

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

  useHotkeys(hotkeys.SELECT_FOLDER.key, () => {
    openFileExplorer();
  });

  useHotkeys(
    hotkeys.REFRESH_FOLDER.key,
    () => {
      if (mainState.fileMap && mainState.fileMap[ROOT_FILE_ENTRY] && mainState.fileMap[ROOT_FILE_ENTRY].filePath) {
        dispatch(setRootFolder(mainState.fileMap[ROOT_FILE_ENTRY].filePath));
      }
    },
    [mainState]
  );

  useHotkeys(hotkeys.TOGGLE_SETTINGS.key, () => {
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
      applyFileWithConfirm(mainState.selectedPath, mainState.fileMap, dispatch, kubeConfigPath, kubeConfigContext);
    }
  }, [
    mainState.selectedResourceId,
    mainState.resourceMap,
    mainState.fileMap,
    kubeConfigPath,
    kubeConfigContext,
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

  const onClickApplyResource = (namespace?: {name: string; new: boolean}) => {
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

    applyResource(
      selectedResource.id,
      mainState.resourceMap,
      mainState.fileMap,
      dispatch,
      projectConfig,
      kubeConfigContext,
      namespace,
      {
        isClusterPreview,
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
      ? makeApplyKustomizationText(selectedResource.name, kubeConfigContext)
      : makeApplyResourceText(selectedResource.name, kubeConfigContext);
  }, [mainState.resourceMap, mainState.selectedResourceId, kubeConfigContext]);

  useHotkeys(
    hotkeys.APPLY_SELECTION.key,
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
    hotkeys.DIFF_RESOURCE.key,
    () => {
      diffSelectedResource();
    },
    [diffSelectedResource]
  );

  useHotkeys(
    hotkeys.PREVIEW_CLUSTER.key,
    () => {
      startPreview(kubeConfigPath, 'cluster', dispatch);
    },
    [kubeConfigPath]
  );

  useHotkeys(
    hotkeys.EXIT_PREVIEW_MODE.key,
    () => {
      if (isInPreviewMode) {
        stopPreview(dispatch);
      }
    },
    [isInPreviewMode]
  );

  useHotkeys(hotkeys.TOGGLE_RIGHT_PANE.key, () => {
    if (!ShowRightMenu) return;
    dispatch(toggleRightMenu());
  });

  useHotkeys(hotkeys.SELECT_FROM_HISTORY_BACK.key, () => {
    selectFromHistory(
      'left',
      mainState.currentSelectionHistoryIndex,
      mainState.selectionHistory,
      mainState.resourceMap,
      mainState.fileMap,
      mainState.imagesMap,
      dispatch
    );
  });

  useHotkeys(hotkeys.SELECT_FROM_HISTORY_FORWARD.key, () => {
    selectFromHistory(
      'right',
      mainState.currentSelectionHistoryIndex,
      mainState.selectionHistory,
      mainState.resourceMap,
      mainState.fileMap,
      mainState.imagesMap,
      dispatch
    );
  });

  useHotkeys(
    hotkeys.OPEN_NEW_RESOURCE_WIZARD.key,
    () => {
      if (!uiState.newResourceWizard.isOpen && mainState.fileMap[ROOT_FILE_ENTRY]) {
        dispatch(openNewResourceWizard());
      }
    },
    [mainState.fileMap[ROOT_FILE_ENTRY]]
  );

  useHotkeys(hotkeys.OPEN_EXPLORER_TAB.key, () => {
    dispatch(setLeftMenuSelection('file-explorer'));
  });

  useHotkeys(hotkeys.OPEN_KUSTOMIZATION_TAB.key, () => {
    dispatch(setLeftMenuSelection('kustomize-pane'));
  });

  useHotkeys(hotkeys.OPEN_HELM_TAB.key, () => {
    dispatch(setLeftMenuSelection('helm-pane'));
  });

  useHotkeys(hotkeys.OPEN_VALIDATION_TAB.key, () => {
    dispatch(toggleValidationDrawer());
  });

  useHotkeys(hotkeys.RESET_RESOURCE_FILTERS.key, () => {
    dispatch(resetResourceFilter());
  });

  useHotkeys(
    hotkeys.OPEN_QUICK_SEARCH.key,
    () => {
      if (!uiState.quickSearchActionsPopup.isOpen) {
        dispatch(openQuickSearchActionsPopup());
      }
    },
    [uiState.quickSearchActionsPopup.isOpen]
  );

  useHotkeys(
    hotkeys.OPEN_GETTING_STARTED_PAGE.key,
    () => {
      if (!uiState.isStartProjectPaneVisible) {
        dispatch(toggleStartProjectPane());
      }
    },
    [uiState.isStartProjectPaneVisible]
  );

  return (
    <>
      <FileExplorer {...fileExplorerProps} />

      {isApplyModalVisible && (
        <ModalConfirmWithNamespaceSelect
          isVisible={isApplyModalVisible}
          resources={applySelectedResource}
          title={confirmModalTitle}
          onOk={namespace => onClickApplyResource(namespace)}
          onCancel={() => setIsApplyModalVisible(false)}
        />
      )}
    </>
  );
};

export default HotKeysHandler;
