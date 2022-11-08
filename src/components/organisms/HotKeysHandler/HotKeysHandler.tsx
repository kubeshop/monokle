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
  openScaleModal,
  setActiveSettingsPanel,
  setActiveTab,
  setLeftBottomMenuSelection,
  setLeftMenuSelection,
  toggleRightMenu,
  toggleStartProjectPane,
} from '@redux/reducers/ui';
import {
  currentConfigSelector,
  isInPreviewModeSelector,
  kubeConfigContextColorSelector,
  kubeConfigContextSelector,
  kubeConfigPathSelector,
  kubeConfigPathValidSelector,
  selectedResourceSelector,
} from '@redux/selectors';
import {applyFileWithConfirm} from '@redux/services/applyFileWithConfirm';
import {isKustomizationResource} from '@redux/services/kustomize';
import {startPreview, stopPreview} from '@redux/services/preview';
import {applyResource} from '@redux/thunks/applyResource';
import {selectFromHistory} from '@redux/thunks/selectionHistory';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {ModalConfirmWithNamespaceSelect} from '@molecules';

import FileExplorer from '@atoms/FileExplorer';

import {SettingsPanel} from '@components/organisms_new/SettingsPane/types';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {useFeatureFlags} from '@utils/features';

const HotKeysHandler = () => {
  const {ShowRightMenu} = useFeatureFlags();
  const dispatch = useAppDispatch();
  const mainState = useAppSelector(state => state.main);
  const uiState = useAppSelector(state => state.ui);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContextColor = useAppSelector(kubeConfigContextColorSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const projectConfig = useAppSelector(currentConfigSelector);
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const currentResource = useAppSelector(selectedResourceSelector);

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
    hotkeys.SCALE.key,
    () => {
      if (currentResource?.kind === 'Deployment' && isInPreviewMode) {
        dispatch(openScaleModal());
      }
    },
    [currentResource, isInPreviewMode]
  );

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
    dispatch(setActiveSettingsPanel(SettingsPanel.ActiveProjectSettings));
    dispatch(setLeftMenuSelection('settings'));
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
      ? makeApplyKustomizationText(selectedResource.name, kubeConfigContext, kubeConfigContextColor)
      : makeApplyResourceText(selectedResource.name, kubeConfigContext, kubeConfigContextColor);
  }, [mainState.resourceMap, mainState.selectedResourceId, kubeConfigContext, kubeConfigContextColor]);

  useHotkeys(
    hotkeys.APPLY_SELECTION.key,
    () => {
      if (!isKubeConfigPathValid) {
        return;
      }

      applySelection();
    },
    [applySelection, isKubeConfigPathValid]
  );

  const diffSelectedResource = useCallback(() => {
    if (mainState.selectedResourceId) {
      dispatch(openResourceDiffModal(mainState.selectedResourceId));
    }
  }, [mainState.selectedResourceId, dispatch]);

  useHotkeys(
    hotkeys.DIFF_RESOURCE.key,
    () => {
      if (!isKubeConfigPathValid) {
        return;
      }

      diffSelectedResource();
    },
    [diffSelectedResource, isKubeConfigPathValid]
  );

  useHotkeys(
    hotkeys.TOGGLE_TERMINAL_PANE.key,
    () => {
      if (uiState.leftMenu.bottomSelection === 'terminal') {
        dispatch(setLeftBottomMenuSelection(undefined));
      } else {
        dispatch(setLeftBottomMenuSelection('terminal'));
      }
    },
    {enableOnTags: ['TEXTAREA']},
    [uiState.leftMenu.bottomSelection]
  );

  useHotkeys(
    hotkeys.PREVIEW_CLUSTER.key,
    () => {
      startPreview(kubeConfigContext, 'cluster', dispatch);
    },
    [kubeConfigContext]
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
      mainState.imagesList,
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
      mainState.imagesList,
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
    dispatch(setLeftMenuSelection('validation-pane'));
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

  useHotkeys(hotkeys.FIND.key, () => {
    dispatch(setLeftMenuSelection('search'));
    dispatch(setActiveTab('search'));
  });

  useHotkeys(hotkeys.REPLACE.key, () => {
    dispatch(setLeftMenuSelection('search'));
    dispatch(setActiveTab('findReplace'));
  });

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
