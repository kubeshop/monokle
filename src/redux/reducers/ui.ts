import {webFrame} from 'electron';

import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import path, {sep} from 'path';
import {Entries} from 'type-fest';

import {DEFAULT_PANE_CONFIGURATION} from '@constants/constants';

import {connectCluster} from '@redux/cluster/thunks/connect';
import initialState from '@redux/initialState';
import {stopClusterConnection} from '@redux/thunks/cluster';
import {previewHelmValuesFile, previewKustomization, previewSavedCommand} from '@redux/thunks/preview';
import {setOpenProject} from '@redux/thunks/project';
import {runPreviewConfiguration} from '@redux/thunks/runPreviewConfiguration';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {Project, SavedCommand, SettingsPanel} from '@shared/models/config';
import {K8sResource, ResourceIdentifier} from '@shared/models/k8sResource';
import {
  ChartInfo,
  ExplorerCollapsibleSectionsType,
  HelmChartDetailsTab,
  HelmRepoMenu,
  LayoutSizeType,
  LearnTopicType,
  LeftMenuBottomSelectionType,
  LeftMenuSelectionType,
  MonacoUiState,
  NewResourceWizardInput,
  PaneConfiguration,
  RightMenuSelectionType,
  StartPageMenuOptions,
  UiState,
} from '@shared/models/ui';
import {trackEvent} from '@shared/utils';
import electronStore from '@shared/utils/electronStore';
import {generateExpandedPaths} from '@shared/utils/file';

import {selectFile} from './main';

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
    toggleLeftMenu: (state: Draft<UiState>) => {
      state.leftMenu.isActive = !state.leftMenu.isActive;
      electronStore.set('ui.leftMenu.isActive', state.leftMenu.isActive);
    },
    setLeftMenuIsActive: (state: Draft<UiState>, action: PayloadAction<boolean>) => {
      state.leftMenu.isActive = action.payload;
      electronStore.set('ui.leftMenu.isActive', state.leftMenu.isActive);
    },
    setLeftBottomMenuSelection: (
      state: Draft<UiState>,
      action: PayloadAction<LeftMenuBottomSelectionType | undefined>
    ) => {
      state.leftMenu.bottomSelection = action.payload;

      if (!action.payload) {
        electronStore.delete('ui.leftMenu.bottomSelection');
      } else {
        electronStore.set('ui.leftMenu.bottomSelection', action.payload);
      }
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
    setPaneConfiguration(state: Draft<UiState>, action: PayloadAction<Partial<PaneConfiguration>>) {
      (Object.entries(action.payload) as Entries<PaneConfiguration>).forEach(([key, value]) => {
        if (action.payload[key]) {
          state.paneConfiguration[key] = value;
        }
      });

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
    openNewAiResourceWizard: (state: Draft<UiState>) => {
      trackEvent('ai/generation/open');
      state.newAiResourceWizard.isOpen = true;
    },
    closeNewAiResourceWizard: (state: Draft<UiState>) => {
      state.newAiResourceWizard.isOpen = false;
    },
    closeNewResourceWizard: (state: Draft<UiState>) => {
      state.newResourceWizard.isOpen = false;
      state.newResourceWizard.defaultInput = undefined;
    },
    openTemplateExplorer: (state: Draft<UiState>) => {
      state.templateExplorer.isVisible = true;
    },
    closeTemplateExplorer: (state: Draft<UiState>) => {
      state.templateExplorer.selectedTemplatePath = undefined;
      state.templateExplorer.isVisible = false;
      state.templateExplorer.projectCreate = undefined;
    },
    setSelectedTemplatePath: (state: Draft<UiState>, action: PayloadAction<string | undefined>) => {
      state.templateExplorer.selectedTemplatePath = action.payload;
    },
    setTemplateProjectCreate: (state: Draft<UiState>, action: PayloadAction<Project | undefined>) => {
      state.templateExplorer.projectCreate = action.payload;
    },
    openRenameEntityModal: (state: Draft<UiState>, action: PayloadAction<{absolutePathToEntity: string}>) => {
      state.renameEntityModal = {
        isOpen: true,
        entityName: path.basename(action.payload.absolutePathToEntity),
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
    openRenameResourceModal: (state: Draft<UiState>, action: PayloadAction<ResourceIdentifier>) => {
      state.renameResourceModal = {
        isOpen: true,
        resourceIdentifier: action.payload,
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
    openSaveResourcesToFileFolderModal: (state: Draft<UiState>, action: PayloadAction<ResourceIdentifier[]>) => {
      state.saveResourcesToFileFolderModal = {
        isOpen: true,
        resourcesIdentifiers: action.payload,
      };
    },
    closeSaveEditCommandModal: (state: Draft<UiState>) => {
      state.saveEditCommandModal = {isOpen: false};
    },
    openSaveEditCommandModal: (state: Draft<UiState>, action: PayloadAction<{command?: SavedCommand}>) => {
      state.saveEditCommandModal.isOpen = true;

      if (action.payload.command) {
        state.saveEditCommandModal.command = action.payload.command;
      }
    },

    closeSaveResourcesToFileFolderModal: (state: Draft<UiState>) => {
      state.saveResourcesToFileFolderModal = {
        isOpen: false,
        resourcesIdentifiers: [],
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
      if (!state.isStartProjectPaneVisible) {
        state.activeSettingsPanel = SettingsPanel.GlobalSettings;
      } else {
        state.activeSettingsPanel = SettingsPanel.ValidationSettings;
      }

      state.isStartProjectPaneVisible = !state.isStartProjectPaneVisible;
    },
    collapsePreviewConfigurationsHelmChart: (state: Draft<UiState>, action: PayloadAction<string>) => {
      state.collapsedPreviewConfigurationsHelmCharts.push(action.payload);
    },

    setIsFromBackToStart: (state: Draft<UiState>, action: PayloadAction<boolean>) => {
      state.startPage.fromBackToStart = action.payload;
    },

    togglePreviewConfigurationsHelmChart: (state: Draft<UiState>, action: PayloadAction<string>) => {
      state.collapsedPreviewConfigurationsHelmCharts = state.collapsedPreviewConfigurationsHelmCharts.filter(
        chart => chart !== action.payload
      );
    },

    collapseHelmChart: (state: Draft<UiState>, action: PayloadAction<string>) => {
      state.collapsedHelmCharts.push(action.payload);
    },

    toggleHelmChart: (state: Draft<UiState>, action: PayloadAction<string>) => {
      state.collapsedHelmCharts = state.collapsedHelmCharts.filter(chart => chart !== action.payload);
    },

    collapseKustomizeKinds: (state: Draft<UiState>, action: PayloadAction<string[]>) => {
      const kindsToCollapse = action.payload.filter(s => !state.collapsedKustomizeKinds.includes(s));
      if (kindsToCollapse.length > 0) {
        state.collapsedKustomizeKinds.push(...kindsToCollapse);
      }
    },
    expandKustomizeKinds: (state: Draft<UiState>, action: PayloadAction<string[]>) => {
      const kindsToExpand = action.payload.filter(s => state.collapsedKustomizeKinds.includes(s));
      if (kindsToExpand.length > 0) {
        state.collapsedKustomizeKinds = state.collapsedKustomizeKinds.filter(n => !kindsToExpand.includes(n));
      }
    },

    collapseResourceKinds: (state: Draft<UiState>, action: PayloadAction<string[]>) => {
      const kindsToCollapse = action.payload.filter(s => !state.navigator.collapsedResourceKinds.includes(s));
      if (kindsToCollapse.length > 0) {
        state.navigator.collapsedResourceKinds.push(...kindsToCollapse);
      }
    },
    expandResourceKinds: (state: Draft<UiState>, action: PayloadAction<string[]>) => {
      const kindsToExpand = action.payload.filter(s => state.navigator.collapsedResourceKinds.includes(s));
      if (kindsToExpand.length > 0) {
        state.navigator.collapsedResourceKinds = state.navigator.collapsedResourceKinds.filter(
          n => !kindsToExpand.includes(n)
        );
      }
    },
    closeWelcomeModal: (state: Draft<UiState>) => {
      state.welcomeModal.isVisible = false;
    },
    openWelcomeModal: (state: Draft<UiState>) => {
      state.welcomeModal.isVisible = true;
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
    openReleaseNotesDrawer: (state: Draft<UiState>) => {
      state.isReleaseNotesDrawerOpen = true;
    },
    openKeyboardShortcutsModal: (state: Draft<UiState>) => {
      state.isKeyboardShortcutsModalOpen = true;
    },
    closeKeyboardShortcutsModal: (state: Draft<UiState>) => {
      state.isKeyboardShortcutsModalOpen = false;
    },
    openFileCompareModal: (state: Draft<UiState>, action: PayloadAction<string>) => {
      state.fileCompareModal = {
        isVisible: true,
        filePath: action.payload,
      };
    },
    closeFileCompareModal: (state: Draft<UiState>) => {
      state.fileCompareModal = {
        isVisible: false,
        filePath: '',
      };
    },
    showNewVersionNotice: (state: Draft<UiState>) => {
      state.newVersionNotice.isVisible = true;
    },
    hideNewVersionNotice: (state: Draft<UiState>) => {
      state.newVersionNotice.isVisible = false;
    },
    setShowOpenProjectAlert: (state: Draft<UiState>, action: PayloadAction<boolean>) => {
      state.showOpenProjectAlert = action.payload;
      electronStore.set('ui.showOpenProjectAlert', action.payload);
    },
    openScaleModal: (state: Draft<UiState>, action: PayloadAction<K8sResource>) => {
      state.scaleModal = {
        isOpen: true,
        resource: action.payload,
      };
    },
    closeScaleModal: (state: Draft<UiState>) => {
      state.scaleModal.isOpen = false;
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
    setShowStartPageLearn: (state: Draft<UiState>, action: PayloadAction<boolean>) => {
      state.startPage.learn.isVisible = action.payload;
    },
    setStartPageLearnTopic: (state: Draft<UiState>, action: PayloadAction<LearnTopicType | undefined>) => {
      state.startPage.learn.learnTopic = action.payload;
    },
    setIsInQuickClusterMode: (state: Draft<UiState>, action: PayloadAction<boolean>) => {
      state.isInQuickClusterMode = action.payload;
    },
    setStartPageMenuOption: (state: Draft<UiState>, action: PayloadAction<StartPageMenuOptions>) => {
      state.startPage.selectedMenuOption = action.payload;
    },
    setExplorerSelectedSection: (state: Draft<UiState>, action: PayloadAction<ExplorerCollapsibleSectionsType>) => {
      state.explorerSelectedSection = action.payload;
    },
    setFileExplorerExpandedFolders: (state: Draft<UiState>, action: PayloadAction<string[]>) => {
      state.fileExplorerExpandedFolders = action.payload;
    },
    setHelmPaneMenuItem: (state: Draft<UiState>, action: PayloadAction<HelmRepoMenu>) => {
      state.helmPane.selectedMenuItem = action.payload;
    },
    setHelmPaneChartSearch: (state: Draft<UiState>, action: PayloadAction<string>) => {
      state.helmPane.chartSearchToken = action.payload;
    },
    setHelmPaneSelectedChart: (state: Draft<UiState>, action: PayloadAction<ChartInfo | null>) => {
      state.helmPane.selectedChart = action.payload;
    },
    setHelmPaneChartDetailsTab: (state: Draft<UiState>, action: PayloadAction<HelmChartDetailsTab>) => {
      state.helmPane.chartDetailsTab = action.payload;
    },
    toggleHelmPanSearchHub: (state: Draft<UiState>) => {
      state.helmPane.isSearchHubIncluded = !state.helmPane.isSearchHubIncluded;
    },
    openHelmRepoModal: (state: Draft<UiState>) => {
      state.helmRepoModal.isOpen = true;
    },
    closeHelmRepoModal: (state: Draft<UiState>) => {
      state.helmRepoModal.isOpen = false;
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
        state.templateExplorer.projectCreate = undefined;
        state.activeSettingsPanel = SettingsPanel.ValidationSettings;
      })
      .addCase(setRootFolder.rejected, state => {
        state.isFolderLoading = false;
      })
      .addCase(selectFile, (state, action) => {
        if (!action.payload.filePath) {
          return;
        }

        const items = action.payload.filePath.split(sep).filter(item => item);
        state.fileExplorerExpandedFolders = [
          ...state.fileExplorerExpandedFolders,
          ...generateExpandedPaths(items, state.fileExplorerExpandedFolders),
        ];
      })
      .addCase(connectCluster.fulfilled, (state, action) => {
        state.leftMenu.activityBeforeClusterConnect = state.leftMenu.selection;
        state.leftMenu.isActive = true;
        state.navigator.collapsedResourceKinds = [];

        if (!action.payload.reload) {
          state.leftMenu.selection = 'dashboard';
        }
      })
      .addCase(stopClusterConnection.fulfilled, state => {
        state.leftMenu.selection = state.leftMenu.activityBeforeClusterConnect ?? 'explorer';
        state.leftMenu.activityBeforeClusterConnect = undefined;
        state.navigator.collapsedResourceKinds = [];
      })
      .addCase(connectCluster.rejected, state => {
        state.leftMenu.selection = 'dashboard';
      })
      .addCase(setOpenProject.fulfilled, state => {
        state.leftMenu.selection = 'explorer';
        state.explorerSelectedSection = 'files';
        state.navigator.collapsedResourceKinds = [];
      })
      .addCase(previewKustomization.fulfilled, state => {
        state.navigator.collapsedResourceKinds = [];
      })
      .addCase(previewHelmValuesFile.fulfilled, state => {
        state.navigator.collapsedResourceKinds = [];
      })
      .addCase(previewSavedCommand.fulfilled, state => {
        state.navigator.collapsedResourceKinds = [];
      })
      .addCase(runPreviewConfiguration.fulfilled, (state, action) => {
        if (action.meta.arg.performDeploy) {
          return;
        }
        state.navigator.collapsedResourceKinds = [];
      });
  },
});

export const {
  closeAboutModal,
  closeCreateFileFolderModal,
  closeCreateProjectModal,
  closeFileCompareModal,
  closeFiltersPresetModal,
  closeFolderExplorer,
  closeKeyboardShortcutsModal,
  closeNewAiResourceWizard,
  closeNewResourceWizard,
  closeQuickSearchActionsPopup,
  closeReleaseNotesDrawer,
  closeRenameEntityModal,
  closeRenameResourceModal,
  closeReplaceImageModal,
  closeSaveEditCommandModal,
  closeSaveResourcesToFileFolderModal,
  closeTemplateExplorer,
  closeWelcomeModal,
  collapseHelmChart,
  collapseKustomizeKinds,
  collapsePreviewConfigurationsHelmChart,
  collapseResourceKinds,
  expandKustomizeKinds,
  expandResourceKinds,
  hideNewVersionNotice,
  openAboutModal,
  openCreateFileFolderModal,
  openCreateProjectModal,
  openFileCompareModal,
  openFiltersPresetModal,
  openFolderExplorer,
  openKeyboardShortcutsModal,
  openNewAiResourceWizard,
  openNewResourceWizard,
  openQuickSearchActionsPopup,
  openReleaseNotesDrawer,
  openRenameEntityModal,
  openRenameResourceModal,
  openReplaceImageModal,
  openSaveEditCommandModal,
  openSaveResourcesToFileFolderModal,
  openTemplateExplorer,
  openWelcomeModal,
  resetLayout,
  setActiveSettingsPanel,
  setExpandedFolders,
  setExpandedSearchedFiles,
  setExplorerSelectedSection,
  setFileExplorerExpandedFolders,
  setIsFromBackToStart,
  setLayoutSize,
  setLeftBottomMenuSelection,
  setLeftMenuIsActive,
  setLeftMenuSelection,
  setMonacoEditor,
  setPaneConfiguration,
  setRightMenuIsActive,
  setRightMenuSelection,
  setSelectedTemplatePath,
  setShowOpenProjectAlert,
  setShowStartPageLearn,
  setStartPageLearnTopic,
  setStartPageMenuOption,
  setTemplateProjectCreate,
  showNewVersionNotice,
  toggleExpandActionsPaneFooter,
  toggleHelmChart,
  toggleLeftMenu,
  toggleNotifications,
  togglePreviewConfigurationsHelmChart,
  toggleResourceFilters,
  toggleRightMenu,
  toggleStartProjectPane,
  zoomIn,
  zoomOut,
  openKubeConfigBrowseSetting,
  closeKubeConfigBrowseSetting,
  setActiveTab,
  openScaleModal,
  closeScaleModal,
  setIsInQuickClusterMode,
  setHelmPaneMenuItem,
  setHelmPaneChartSearch,
  setHelmPaneSelectedChart,
  setHelmPaneChartDetailsTab,
  toggleHelmPanSearchHub,
  openHelmRepoModal,
  closeHelmRepoModal,
} = uiSlice.actions;
export default uiSlice.reducer;
