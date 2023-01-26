import {useCallback, useMemo, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import {makeApplyKustomizationText, makeApplyResourceText} from '@constants/makeApplyText';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openResourceDiffModal, resetResourceFilter} from '@redux/reducers/main';
import {
  openNewResourceWizard,
  openQuickSearchActionsPopup,
  openScaleModal,
  setActiveTab,
  setLeftBottomMenuSelection,
  setLeftMenuSelection,
  toggleRightMenu,
  toggleSettings,
  toggleStartProjectPane,
} from '@redux/reducers/ui';
import {
  currentConfigSelector,
  isInClusterModeSelector,
  isInPreviewModeSelectorNew,
  kubeConfigContextColorSelector,
  kubeConfigPathSelector,
  rootFilePathSelector,
  selectedFilePathSelector,
  selectedResourceWithMapSelector,
} from '@redux/selectors';
import {applyFileWithConfirm} from '@redux/services/applyFileWithConfirm';
import {isKustomizationResource} from '@redux/services/kustomize';
import {stopPreview} from '@redux/services/preview';
import {applyResource} from '@redux/thunks/applyResource';
import {startClusterConnection} from '@redux/thunks/cluster';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {ModalConfirmWithNamespaceSelect} from '@molecules';

import FileExplorer from '@atoms/FileExplorer';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {useFeatureFlags} from '@utils/features';

import {hotkeys} from '@shared/constants/hotkeys';
import {selectFromHistory} from '@shared/utils/selectionHistory';
import {kubeConfigContextSelector, kubeConfigPathValidSelector} from '@shared/utils/selectors';

const HotKeysHandler = () => {
  const {ShowRightMenu} = useFeatureFlags();
  const dispatch = useAppDispatch();
  const uiState = useAppSelector(state => state.ui);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContextColor = useAppSelector(kubeConfigContextColorSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const projectConfig = useAppSelector(currentConfigSelector);
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const isInQuickClusterMode = useAppSelector(state => state.ui.isInQuickClusterMode);
  const rootFilePath = useAppSelector(rootFilePathSelector);
  const selectedFilePath = useAppSelector(selectedFilePathSelector);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const selectionHistory = useAppSelector(state => state.main.selectionHistory);
  const resourceMetaStorage = useAppSelector(state => state.main.resourceMetaStorage);
  const imagesList = useAppSelector(state => state.main.imagesList);
  const {selectedResource, resourceMap} = useAppSelector(selectedResourceWithMapSelector);

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
      if (selectedResource?.kind === 'Deployment' && isInClusterMode) {
        dispatch(openScaleModal());
      }
    },
    [selectedResource, isInClusterMode]
  );

  useHotkeys(
    hotkeys.REFRESH_FOLDER.key,
    () => {
      if (rootFilePath) {
        dispatch(setRootFolder(rootFilePath));
      }
    },
    [rootFilePath]
  );

  useHotkeys(hotkeys.TOGGLE_SETTINGS.key, () => {
    dispatch(toggleSettings());
  });

  const applySelection = useCallback(() => {
    if (selectedResource) {
      setIsApplyModalVisible(true);
    } else if (selectedFilePath) {
      applyFileWithConfirm(selectedFilePath, fileMap, dispatch, kubeConfigPath, kubeConfigContext);
    }
  }, [selectedResource, fileMap, kubeConfigPath, kubeConfigContext, selectedFilePath, dispatch]);

  const onClickApplyResource = (namespace?: {name: string; new: boolean}) => {
    if (!selectedResource || !resourceMap) {
      setIsApplyModalVisible(false);
      return;
    }

    applyResource(selectedResource.id, resourceMap, fileMap, dispatch, projectConfig, kubeConfigContext, namespace, {
      isInClusterMode,
    });
    setIsApplyModalVisible(false);
  };

  const confirmModalTitle = useMemo(() => {
    if (!selectedResource) {
      return '';
    }

    return isKustomizationResource(selectedResource)
      ? makeApplyKustomizationText(selectedResource.name, kubeConfigContext, kubeConfigContextColor)
      : makeApplyResourceText(selectedResource.name, kubeConfigContext, kubeConfigContextColor);
  }, [selectedResource, kubeConfigContext, kubeConfigContextColor]);

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
    if (selectedResource) {
      dispatch(openResourceDiffModal(selectedResource.id));
    }
  }, [selectedResource, dispatch]);

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
    hotkeys.LOAD_CLUSTER.key,
    () => {
      startClusterConnection({context: kubeConfigContext});
    },
    [kubeConfigContext]
  );

  useHotkeys(
    hotkeys.EXIT_PREVIEW_MODE.key,
    () => {
      if (isInPreviewMode && !isInClusterMode) {
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
      selectionHistory.index,
      selectionHistory.current,
      resourceMetaStorage,
      fileMap,
      imagesList,
      dispatch
    );
  });

  useHotkeys(hotkeys.SELECT_FROM_HISTORY_FORWARD.key, () => {
    selectFromHistory(
      'right',
      selectionHistory.index,
      selectionHistory.current,
      resourceMetaStorage,
      fileMap,
      imagesList,
      dispatch
    );
  });

  useHotkeys(
    hotkeys.OPEN_NEW_RESOURCE_WIZARD.key,
    () => {
      if (!uiState.newResourceWizard.isOpen && rootFilePath) {
        dispatch(openNewResourceWizard());
      }
    },
    [rootFilePath]
  );

  useHotkeys(hotkeys.OPEN_EXPLORER_TAB.key, () => {
    if (!isInQuickClusterMode) {
      dispatch(setLeftMenuSelection('file-explorer'));
    }
  });

  useHotkeys(hotkeys.OPEN_KUSTOMIZATION_TAB.key, () => {
    if (!isInQuickClusterMode) {
      dispatch(setLeftMenuSelection('kustomize-pane'));
    }
  });

  useHotkeys(hotkeys.OPEN_HELM_TAB.key, () => {
    if (!isInQuickClusterMode) {
      dispatch(setLeftMenuSelection('helm-pane'));
    }
  });

  useHotkeys(hotkeys.OPEN_VALIDATION_TAB.key, () => {
    if (!isInQuickClusterMode) {
      dispatch(setLeftMenuSelection('validation-pane'));
    }
  });

  useHotkeys(hotkeys.OPEN_TUTORIAL_PAGE.key, () => {
    dispatch(setLeftMenuSelection('tutorial'));
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
    hotkeys.OPEN_TUTORIAL_PAGE.key,
    () => {
      if (!uiState.isStartProjectPaneVisible) {
        dispatch(toggleStartProjectPane());
      }
    },
    [uiState.isStartProjectPaneVisible]
  );

  useHotkeys(hotkeys.FIND.key, () => {
    if (!isInQuickClusterMode) {
      dispatch(setLeftMenuSelection('search'));
      dispatch(setActiveTab('search'));
    }
  });

  useHotkeys(hotkeys.REPLACE.key, () => {
    if (!isInQuickClusterMode) {
      dispatch(setLeftMenuSelection('search'));
      dispatch(setActiveTab('findReplace'));
    }
  });

  return (
    <>
      <FileExplorer {...fileExplorerProps} />

      {isApplyModalVisible && (
        <ModalConfirmWithNamespaceSelect
          isVisible={isApplyModalVisible}
          resourceMetaList={selectedResource ? [selectedResource] : undefined}
          title={confirmModalTitle}
          onOk={namespace => onClickApplyResource(namespace)}
          onCancel={() => setIsApplyModalVisible(false)}
        />
      )}
    </>
  );
};

export default HotKeysHandler;
