import {webFrame} from 'electron';

import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import path from 'path';

import {ACTIONS_PANE_FOOTER_EXPANDED_DEFAULT_HEIGHT, ROOT_FILE_ENTRY} from '@constants/constants';

import {
  HighlightItems,
  LayoutSizeType,
  LeftMenuSelectionType,
  MonacoUiState,
  NewResourceWizardInput,
  PaneConfiguration,
  RightMenuSelectionType,
  UiState,
} from '@models/ui';

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
      webFrame.setZoomFactor(webFrame.getZoomFactor() + 0.1);
    },
    zoomOut: () => {
      webFrame.setZoomFactor(Number(webFrame.getZoomFactor() - 0.1));
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
    setLeftMenuSelection: (state: Draft<UiState>, action: PayloadAction<LeftMenuSelectionType>) => {
      state.leftMenu.selection = action.payload;
      electronStore.set('ui.leftMenu.selection', state.leftMenu.selection);
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
    openCreateFolderModal: (state: Draft<UiState>, action: PayloadAction<string>) => {
      state.createFolderModal = {
        isOpen: true,
        rootDir: action.payload,
      };
    },
    closeCreateFolderModal: (state: Draft<UiState>) => {
      state.createFolderModal = {
        isOpen: false,
        rootDir: '',
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
      const defaultPaneConfiguration = {
        leftWidth: 0.3333,
        navWidth: 0.3333,
        editWidth: 0.3333,
        rightWidth: 0,
        actionsPaneFooterExpandedHeight: ACTIONS_PANE_FOOTER_EXPANDED_DEFAULT_HEIGHT,
        recentProjectsPaneWidth: 450,
      };
      state.paneConfiguration = defaultPaneConfiguration;
      electronStore.set('ui.paneConfiguration', defaultPaneConfiguration);
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
    closeReleaseNotesDrawer: (state: Draft<UiState>) => {
      state.isReleaseNotesDrawerOpen = false;
    },
    openAboutModal: (state: Draft<UiState>) => {
      state.isAboutModalOpen = true;
    },
    closeAboutModal: (state: Draft<UiState>) => {
      state.isAboutModalOpen = false;
    },
    cancelWalkThrough: (state: Draft<UiState>) => {
      state.walkThrough.currentStep = -1;
    },
    handleWalkThroughStep: (state: Draft<UiState>, action: PayloadAction<number>) => {
      state.walkThrough.currentStep += action.payload;
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
  toggleResourceFilters,
  toggleSettings,
  openClusterDiff,
  closeClusterDiff,
  toggleLeftMenu,
  toggleRightMenu,
  toggleNotifications,
  setLeftMenuSelection,
  setRightMenuSelection,
  openNewResourceWizard,
  closeNewResourceWizard,
  openRenameResourceModal,
  closeRenameResourceModal,
  collapseNavSections,
  expandNavSections,
  openFolderExplorer,
  closeFolderExplorer,
  setMonacoEditor,
  setPaneConfiguration,
  toggleStartProjectPane,
  setRightMenuIsActive,
  setLeftMenuIsActive,
  openRenameEntityModal,
  closeRenameEntityModal,
  openCreateFolderModal,
  closeCreateFolderModal,
  openCreateProjectModal,
  closeCreateProjectModal,
  toggleExpandActionsPaneFooter,
  resetLayout,
  setLayoutSize,
  highlightItem,
  openQuickSearchActionsPopup,
  closeQuickSearchActionsPopup,
  openSaveResourcesToFileFolderModal,
  closeSaveResourcesToFileFolderModal,
  zoomIn,
  zoomOut,
  openReleaseNotesDrawer,
  closeReleaseNotesDrawer,
  setActiveSettingsPanel,
  openAboutModal,
  closeAboutModal,
  setExpandedFolders,
  cancelWalkThrough,
  handleWalkThroughStep,
} = uiSlice.actions;
export default uiSlice.reducer;
