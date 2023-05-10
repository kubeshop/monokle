import {useCallback, useMemo, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import {makeApplyKustomizationText, makeApplyResourceText} from '@constants/makeApplyText';

import {
  kubeConfigContextColorSelector,
  kubeConfigContextSelector,
  kubeConfigPathSelector,
  kubeConfigPathValidSelector,
} from '@redux/appConfig';
import {connectCluster} from '@redux/cluster/thunks/connect';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openResourceDiffModal, resetResourceFilter} from '@redux/reducers/main';
import {
  openFolderExplorer,
  openNewResourceWizard,
  openQuickSearchActionsPopup,
  openScaleModal,
  setLeftBottomMenuSelection,
  setLeftMenuSelection,
  setStartPageMenuOption,
  toggleLeftMenu,
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

import {useRefSelector} from '@utils/hooks';

import {hotkeys} from '@shared/constants/hotkeys';
import {activeProjectSelector, isInClusterModeSelector, isInPreviewModeSelector} from '@shared/utils/selectors';

const HotKeysHandler = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const isInQuickClusterMode = useAppSelector(state => state.ui.isInQuickClusterMode);
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const isNewResourceWizardOpened = useAppSelector(state => state.ui.newResourceWizard.isOpen);
  const isQuickSearchActionsPopupOpened = useAppSelector(state => state.ui.quickSearchActionsPopup.isOpen);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContextColor = useAppSelector(kubeConfigContextColorSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);
  const rootFilePath = useAppSelector(rootFilePathSelector);
  const selectedFilePath = useAppSelector(selectedFilePathSelector);
  const selectedResource = useSelectedResource();

  const fileMapRef = useRefSelector(state => state.main.fileMap);

  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);

  useHotkeys(hotkeys.SELECT_FOLDER.key, () => {
    dispatch(openFolderExplorer());
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
        dispatch(setRootFolder({rootFolder: rootFilePath}));
      }
    },
    [rootFilePath]
  );

  useHotkeys(
    hotkeys.TOGGLE_SETTINGS.key,
    () => {
      if (isStartProjectPaneVisible) {
        dispatch(setStartPageMenuOption('settings'));
        return;
      }

      dispatch(setLeftMenuSelection('settings'));
    },
    {splitKey: '&'},
    [isStartProjectPaneVisible]
  );

  useHotkeys(
    hotkeys.TOGGLE_LEFT_PANE.key,
    () => {
      if (isInQuickClusterMode || leftMenuSelection !== 'explorer') {
        return;
      }

      dispatch(toggleLeftMenu());
    },
    [isInQuickClusterMode, leftMenuSelection]
  );

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
      dispatch(connectCluster({context: kubeConfigContext}));
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
    [isInPreviewMode, isInClusterMode]
  );

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
    [isNewResourceWizardOpened, rootFilePath, isInClusterMode, isInPreviewMode]
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
      if (!isQuickSearchActionsPopupOpened && activeProject && !isStartProjectPaneVisible) {
        dispatch(openQuickSearchActionsPopup());
      }
    },
    [isQuickSearchActionsPopupOpened, activeProject, isStartProjectPaneVisible]
  );

  return (
    <>
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
