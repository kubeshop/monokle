import {useCallback, useMemo, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import {makeApplyKustomizationText, makeApplyResourceText} from '@constants/makeApplyText';

import {
  isInClusterModeSelector,
  kubeConfigContextColorSelector,
  kubeConfigContextSelector,
  kubeConfigPathSelector,
  kubeConfigPathValidSelector,
} from '@redux/appConfig';
import {connectCluster} from '@redux/cluster/thunks/connect';
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
} from '@redux/reducers/ui';
import {rootFilePathSelector, selectedFilePathSelector} from '@redux/selectors';
import {useSelectedResource} from '@redux/selectors/resourceSelectors';
import {applyFileWithConfirm} from '@redux/services/applyFileWithConfirm';
import {isKustomizationResource} from '@redux/services/kustomize';
import {stopPreview} from '@redux/services/preview';
import {applyResourceToCluster} from '@redux/thunks/applyResource';
import {selectFromHistory} from '@redux/thunks/selectFromHistory';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {ModalConfirmWithNamespaceSelect} from '@molecules';

import FileExplorer from '@atoms/FileExplorer';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {useFeatureFlags} from '@utils/features';
import {useRefSelector} from '@utils/hooks';

import {hotkeys} from '@shared/constants/hotkeys';
import {isInPreviewModeSelector} from '@shared/utils/selectors';

const HotKeysHandler = () => {
  const {ShowRightMenu} = useFeatureFlags();
  const dispatch = useAppDispatch();
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const isNewResourceWizardOpened = useAppSelector(state => state.ui.newResourceWizard.isOpen);
  const isQuickSearchActionsPopupOpened = useAppSelector(state => state.ui.quickSearchActionsPopup.isOpen);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContextColor = useAppSelector(kubeConfigContextColorSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const isInQuickClusterMode = useAppSelector(state => state.ui.isInQuickClusterMode);
  const rootFilePath = useAppSelector(rootFilePathSelector);
  const selectedFilePath = useAppSelector(selectedFilePathSelector);
  const selectedResource = useSelectedResource();

  const fileMapRef = useRefSelector(state => state.main.fileMap);

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
    if (!isInQuickClusterMode) {
      dispatch(setLeftMenuSelection('settings'));
    }
  });

  const applySelection = useCallback(() => {
    if (selectedResource) {
      setIsApplyModalVisible(true);
    } else if (selectedFilePath) {
      applyFileWithConfirm(selectedFilePath, fileMapRef.current, dispatch, kubeConfigPath, kubeConfigContext);
    }
  }, [selectedResource, fileMapRef, kubeConfigPath, kubeConfigContext, selectedFilePath, dispatch]);

  const onClickApplyResource = (namespace?: {name: string; new: boolean}) => {
    if (!selectedResource) {
      setIsApplyModalVisible(false);
      return;
    }

    dispatch(
      applyResourceToCluster({
        resourceIdentifier: selectedResource,
        namespace,
        options: {
          isInClusterMode,
        },
      })
    );

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
      if (bottomSelection === 'terminal') {
        dispatch(setLeftBottomMenuSelection(undefined));
      } else {
        dispatch(setLeftBottomMenuSelection('terminal'));
      }
    },
    {enableOnFormTags: ['TEXTAREA']},
    [bottomSelection]
  );

  useHotkeys(
    hotkeys.LOAD_CLUSTER.key,
    () => {
      connectCluster({context: kubeConfigContext});
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
    dispatch(selectFromHistory('left'));
  });

  useHotkeys(hotkeys.SELECT_FROM_HISTORY_FORWARD.key, () => {
    dispatch(selectFromHistory('right'));
  });

  useHotkeys(
    hotkeys.OPEN_NEW_RESOURCE_WIZARD.key,
    () => {
      if (!isNewResourceWizardOpened && rootFilePath && !isInClusterMode && !isInPreviewMode) {
        dispatch(openNewResourceWizard());
      }
    },
    [isNewResourceWizardOpened, rootFilePath]
  );

  useHotkeys(hotkeys.OPEN_EXPLORER_TAB.key, () => {
    if (!isInQuickClusterMode) {
      dispatch(setLeftMenuSelection('explorer'));
    }
  });

  useHotkeys(hotkeys.OPEN_VALIDATION_TAB.key, () => {
    if (!isInQuickClusterMode) {
      dispatch(setLeftMenuSelection('validation'));
    }
  });

  useHotkeys(hotkeys.RESET_RESOURCE_FILTERS.key, () => {
    dispatch(resetResourceFilter());
  });

  useHotkeys(
    hotkeys.OPEN_QUICK_SEARCH.key,
    () => {
      if (!isQuickSearchActionsPopupOpened) {
        dispatch(openQuickSearchActionsPopup());
      }
    },
    [isQuickSearchActionsPopupOpened]
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
