import {webFrame} from 'electron';

import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import path from 'path';

import {DEFAULT_PANE_CONFIGURATION, ROOT_FILE_ENTRY} from '@constants/constants';

import {
  HighlightItems,
  LayoutSizeType,
  LeftMenuBottomSelectionType,
  LeftMenuSelectionType,
  MonacoUiState,
  NewResourceWizardInput,
  PaneConfiguration,
  RightMenuSelectionType,
  UiState,
} from '@models/ui';
import {WalkthroughCollection} from '@models/walkthrough';

import initialState from '@redux/initialState';
import {isKustomizationResource} from '@redux/services/kustomize';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {SettingsPanel} from '@organisms/SettingsManager/types';

import electronStore from '@utils/electronStore';

export const uiSlice = createSlice({
  name: 'ui',
  initialState: initialState.ui,
  reducers: {
    toggleResourceFilters: (state: Draft<UiState>) => {
      state.isResourceFiltersOpen = !state.isResourceFiltersOpen;
    },
    zoomIn: () => {
      const newZoomFactor = webFrame.getZoomFactor() + 0.1;

      electronStore.set('ui.zoomFactor', newZoomFactor);
      webFrame.setZoomFactor(newZoomFactor);
    },
    zoomOut: () => {
      const newZoomFactor = webFrame.getZoomFactor() - 0.1;

      electronStore.set('ui.zoomFactor', newZoomFactor);
      webFrame.setZoomFactor(newZoomFactor);
    },
    toggleSettings: (state: Draft<UiState>) => {
      state.isSettingsOpen = !state.isSettingsOpen;
    },
    openClusterDiff: (state: Draft<UiState>) => {
      state.isClusterDiffVisible = true;
    },
    closeClusterDiff: (state: Draft<UiState>) => {
      state.isClusterDiffVisible = false;
    },
    toggleLeftMenu: (state: Draft<UiState>) => {
      state.leftMenu.isActive = !state.leftMenu.isActive;
      electronStore.set('ui.leftMenu.isActive', state.leftMenu.isActive);
    },
    setLeftMenuIsActive: (state: Draft<UiState>, action: PayloadAction<boolean>) => {
      state.leftMenu.isActive = action.payload;
      electronStore.set('ui.leftMenu.isActive', state.leftMenu.isActive);
    },
    setLeftBottomMenuSelection: (state: Draft<UiState>, action: PayloadAction<LeftMenuBottomSelectionType>) => {
      state.leftMenu.bottomSelection = action.payload;
      electronStore.set('ui.leftMenu.bottomSelection', action.payload);
    },
    setLeftMenuSelection: (state: Draft<UiState>, action: PayloadAction<LeftMenuSelectionType>) => {
      state.leftMenu.selection = action.payload;
      electronStore.set('ui.leftMenu.selection', state.leftMenu.selection);
    },
    setActiveTab: (state: Draft<UiState>, action: PayloadAction<string | null>) => {
      state.leftMenu.activeTab = action.payload;
    },
    toggleRightMenu: (state: Draft<UiState>) => {
      state.rightMenu.isActive = !state.rightMenu.isActive;
      electronStore.set('ui.rightMenu.isActive', state.rightMenu.isActive);
    },
    setLayoutSize: (state: Draft<UiState>, action: PayloadAction<LayoutSizeType>) => {
      state.layoutSize = action.payload;
    },
    toggleNotifications: (state: Draft<UiState>) => {
      state.isNotificationsOpen = !state.isNotificationsOpen;
    },
    setRightMenuIsActive: (state: Draft<UiState>, action: PayloadAction<boolean>) => {
      state.rightMenu.isActive = action.payload;
      electronStore.set('ui.rightMenu.isActive', state.rightMenu.isActive);
    },
    setActiveSettingsPanel: (state: Draft<UiState>, action: PayloadAction<SettingsPanel>) => {
      state.activeSettingsPanel = action.payload;
    },
    setRightMenuSelection: (state: Draft<UiState>, action: PayloadAction<RightMenuSelectionType>) => {
      state.rightMenu.selection = action.payload;
      electronStore.set('ui.rightMenu.selection', state.rightMenu.selection);
    },
    setPaneConfiguration(state: Draft<UiState>, action: PayloadAction<PaneConfiguration>) {
      state.paneConfiguration = action.payload;
      electronStore.set('ui.paneConfiguration', state.paneConfiguration);
    },
    openNewResourceWizard: (
      state: Draft<UiState>,
      action: PayloadAction<{defaultInput?: NewResourceWizardInput} | undefined>
    ) => {
      state.newResourceWizard.isOpen = true;
      if (action.payload && action.payload.defaultInput) {
        state.newResourceWizard.defaultInput = action.payload.defaultInput;
      }
    },
    closeNewResourceWizard: (state: Draft<UiState>) => {
      state.newResourceWizard.isOpen = false;
      state.newResourceWizard.defaultInput = undefined;
    },
    openRenameEntityModal: (
      state: Draft<UiState>,
      action: PayloadAction<{absolutePathToEntity: string; osPlatform: string}>
    ) => {
      const getBasename = action.payload.osPlatform === 'win32' ? path.win32.basename : path.basename;

      state.renameEntityModal = {
        isOpen: true,
        entityName: getBasename(action.payload.absolutePathToEntity),
        absolutePathToEntity: action.payload.absolutePathToEntity,
      };
    },
    closeRenameEntityModal: (state: Draft<UiState>) => {
      state.renameEntityModal = {
        isOpen: false,
        entityName: '',
        absolutePathToEntity: '',
      };
    },
    openRenameResourceModal: (state: Draft<UiState>, action: PayloadAction<string>) => {
      state.renameResourceModal = {
        isOpen: true,
        resourceId: action.payload,
      };
    },
    closeReplaceImageModal: (state: Draft<UiState>) => {
      state.replaceImageModal = {
        isOpen: false,
        imageId: '',
      };
    },
    openReplaceImageModal: (state: Draft<UiState>, action: PayloadAction<string>) => {
      state.replaceImageModal = {
        isOpen: true,
        imageId: action.payload,
      };
    },
    closeFiltersPresetModal: (state: Draft<UiState>) => {
      state.filtersPresetModal = undefined;
    },
    openFiltersPresetModal: (state: Draft<UiState>, action: PayloadAction<'load' | 'save'>) => {
      state.filtersPresetModal = {
        isOpen: true,
        type: action.payload,
      };
    },
    openSaveResourcesToFileFolderModal: (state: Draft<UiState>, action: PayloadAction<string[]>) => {
      state.saveResourcesToFileFolderModal = {
        isOpen: true,
        resourcesIds: action.payload,
      };
    },
    closeSaveResourcesToFileFolderModal: (state: Draft<UiState>) => {
      state.saveResourcesToFileFolderModal = {
        isOpen: false,
        resourcesIds: [],
      };
    },
    openCreateFileFolderModal: (
      state: Draft<UiState>,
      action: PayloadAction<{rootDir: string; type: 'file' | 'folder'}>
    ) => {
      const {rootDir, type} = action.payload;

      state.createFileFolderModal = {isOpen: true, rootDir, type};
    },
    closeCreateFileFolderModal: (state: Draft<UiState>) => {
      state.createFileFolderModal = {
        isOpen: false,
        rootDir: '',
        type: 'folder',
      };
    },
    openCreateProjectModal: (state: Draft<UiState>, action: PayloadAction<{fromTemplate: boolean}>) => {
      state.createProjectModal = {
        isOpen: true,
        fromTemplate: action.payload.fromTemplate,
      };
    },
    closeCreateProjectModal: (state: Draft<UiState>) => {
      state.createProjectModal = {
        isOpen: false,
        fromTemplate: false,
      };
    },
    closeRenameResourceModal: (state: Draft<UiState>) => {
      state.renameResourceModal = undefined;
    },
    toggleStartProjectPane: (state: Draft<UiState>) => {
      state.isStartProjectPaneVisible = !state.isStartProjectPaneVisible;
    },
    collapseNavSections: (state: Draft<UiState>, action: PayloadAction<string[]>) => {
      const expandedSections = action.payload.filter(s => !state.navPane.collapsedNavSectionNames.includes(s));
      if (expandedSections.length > 0) {
        state.navPane.collapsedNavSectionNames.push(...expandedSections);
      }
    },
    expandNavSections: (state: Draft<UiState>, action: PayloadAction<string[]>) => {
      const collapsedSections = action.payload.filter(s => state.navPane.collapsedNavSectionNames.includes(s));
      if (collapsedSections.length > 0) {
        state.navPane.collapsedNavSectionNames = state.navPane.collapsedNavSectionNames.filter(
          n => !collapsedSections.includes(n)
        );
      }
    },
    setExpandedFolders: (state: Draft<UiState>, action: PayloadAction<React.Key[]>) => {
      state.leftMenu.expandedFolders = action.payload;
    },
    setExpandedSearchedFiles: (state: Draft<UiState>, action: PayloadAction<React.Key[]>) => {
      state.leftMenu.expandedSearchedFiles = action.payload;
    },
    openQuickSearchActionsPopup: (state: Draft<UiState>) => {
      state.quickSearchActionsPopup.isOpen = true;
    },
    closeQuickSearchActionsPopup: (state: Draft<UiState>) => {
      state.quickSearchActionsPopup.isOpen = false;
    },
    openFolderExplorer: (state: Draft<UiState>) => {
      state.folderExplorer = {isOpen: true};
    },
    closeFolderExplorer: (state: Draft<UiState>) => {
      state.folderExplorer = {isOpen: false};
    },
    closeKubeConfigBrowseSetting: (state: Draft<UiState>) => {
      state.kubeConfigBrowseSettings = {isOpen: false};
    },
    openKubeConfigBrowseSetting: (state: Draft<UiState>) => {
      state.kubeConfigBrowseSettings = {isOpen: true};
    },
    setMonacoEditor: (state: Draft<UiState>, action: PayloadAction<Partial<MonacoUiState>>) => {
      state.monacoEditor = {
        ...state.monacoEditor,
        ...action.payload,
      };
    },
    toggleExpandActionsPaneFooter: (state: Draft<UiState>) => {
      if (state.isActionsPaneFooterExpanded) {
        state.isActionsPaneFooterExpanded = false;
      } else {
        state.isActionsPaneFooterExpanded = true;
      }
    },
    resetLayout: (state: Draft<UiState>) => {
      state.leftMenu.isActive = true;
      electronStore.set('ui.leftMenu.isActive', true);
      state.rightMenu.isActive = false;
      electronStore.set('ui.rightMenu.isActive', false);
      state.paneConfiguration = DEFAULT_PANE_CONFIGURATION;
      electronStore.set('ui.paneConfiguration', DEFAULT_PANE_CONFIGURATION);
    },
    highlightItem: (state: Draft<UiState>, action: PayloadAction<string | null>) => {
      state.highlightedItems.clusterPaneIcon = action.payload === HighlightItems.CLUSTER_PANE_ICON;
      state.highlightedItems.createResource = action.payload === HighlightItems.CREATE_RESOURCE;
      state.highlightedItems.browseTemplates = action.payload === HighlightItems.BROWSE_TEMPLATES;
      state.highlightedItems.connectToCluster = action.payload === HighlightItems.CONNECT_TO_CLUSTER;
    },
    openReleaseNotesDrawer: (state: Draft<UiState>) => {
      state.isReleaseNotesDrawerOpen = true;
    },
    openKeyboardShortcutsModal: (state: Draft<UiState>) => {
      state.isKeyboardShortcutsModalOpen = true;
    },
    closeKeyboardShortcutsModal: (state: Draft<UiState>) => {
      state.isKeyboardShortcutsModalOpen = false;
    },
    openScaleModal: (state: Draft<UiState>) => {
      state.isScaleModalOpen = true;
    },
    closeScaleModal: (state: Draft<UiState>) => {
      state.isScaleModalOpen = false;
    },
    closeReleaseNotesDrawer: (state: Draft<UiState>) => {
      state.isReleaseNotesDrawerOpen = false;
    },
    openAboutModal: (state: Draft<UiState>) => {
      state.isAboutModalOpen = true;
    },
    closeAboutModal: (state: Draft<UiState>) => {
      state.isAboutModalOpen = false;
    },
    cancelWalkthrough: (state: Draft<UiState>, action: PayloadAction<WalkthroughCollection>) => {
      const collection = action.payload;
      state.walkThrough[collection].currentStep = -1;
    },
    handleWalkthroughStep: (
      state: Draft<UiState>,
      action: PayloadAction<{step: number; collection: WalkthroughCollection}>
    ) => {
      const {step, collection} = action.payload;
      state.walkThrough[collection].currentStep += step;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(setRootFolder.pending, state => {
        state.isFolderLoading = true;
      })
      .addCase(setRootFolder.fulfilled, (state, action) => {
        state.isFolderLoading = false;

        // Expand all folders on setting root folder
        const nodes = Object.values(action.payload.fileMap);
        const folders = nodes.filter(node => node.children?.length);
        const folderKeys = folders.map(folder => (folder.name === ROOT_FILE_ENTRY ? ROOT_FILE_ENTRY : folder.filePath));
        state.leftMenu.expandedFolders = folderKeys;

        if (
          state.leftMenu.selection === 'kustomize-pane' &&
          !Object.values(action.payload.resourceMap).some(r => isKustomizationResource(r))
        ) {
          state.leftMenu.selection = 'file-explorer';
        }
        if (state.leftMenu.selection === 'helm-pane' && Object.values(action.payload.helmChartMap).length === 0) {
          state.leftMenu.selection = 'file-explorer';
        }
      })
      .addCase(setRootFolder.rejected, state => {
        state.isFolderLoading = false;
      });
  },
});

export const {
  cancelWalkthrough,
  closeAboutModal,
  closeClusterDiff,
  closeCreateFileFolderModal,
  closeCreateProjectModal,
  closeFiltersPresetModal,
  closeFolderExplorer,
  closeKeyboardShortcutsModal,
  closeNewResourceWizard,
  closeQuickSearchActionsPopup,
  closeReleaseNotesDrawer,
  closeRenameEntityModal,
  closeRenameResourceModal,
  closeReplaceImageModal,
  closeSaveResourcesToFileFolderModal,
  collapseNavSections,
  expandNavSections,
  handleWalkthroughStep,
  highlightItem,
  openAboutModal,
  openClusterDiff,
  openCreateFileFolderModal,
  openCreateProjectModal,
  openFiltersPresetModal,
  openFolderExplorer,
  openKeyboardShortcutsModal,
  openNewResourceWizard,
  openQuickSearchActionsPopup,
  openReleaseNotesDrawer,
  openRenameEntityModal,
  openRenameResourceModal,
  openReplaceImageModal,
  openSaveResourcesToFileFolderModal,
  resetLayout,
  setActiveSettingsPanel,
  setExpandedFolders,
  setExpandedSearchedFiles,
  setLayoutSize,
  setLeftBottomMenuSelection,
  setLeftMenuIsActive,
  setLeftMenuSelection,
  setMonacoEditor,
  setPaneConfiguration,
  setRightMenuIsActive,
  setRightMenuSelection,
  toggleExpandActionsPaneFooter,
  toggleLeftMenu,
  toggleNotifications,
  toggleResourceFilters,
  toggleRightMenu,
  toggleSettings,
  toggleStartProjectPane,
  zoomIn,
  zoomOut,
  openKubeConfigBrowseSetting,
  closeKubeConfigBrowseSetting,
  setActiveTab,
  openScaleModal,
  closeScaleModal,
} = uiSlice.actions;
export default uiSlice.reducer;
