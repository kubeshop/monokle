import os from 'os';

import {AlertState} from '@models/alert';
import {AppConfig, NewVersionCode} from '@models/appconfig';
import {AppState} from '@models/appstate';
import {ExtensionState} from '@models/extension';
import {LogsState} from '@models/logs';
import {NavigatorState} from '@models/navigator';
import {UiState} from '@models/ui';
import {UiCoachState} from '@models/uiCoach';

import electronStore from '@utils/electronStore';

const initialAppState: AppState = {
  isRehydrating: false,
  wasRehydrated: false,
  selectionHistory: [],
  resourceMap: {},
  resourceFilter: {
    labels: {},
    annotations: {},
  },
  fileMap: {},
  helmChartMap: {},
  helmValuesMap: {},
  previewLoader: {
    isLoading: false,
  },
  resourceDiff: {},
  isSelectingFile: false,
  isApplyingResource: false,
  resourceRefsProcessingOptions: {
    shouldIgnoreOptionalUnsatisfiedRefs: electronStore.get(
      'main.resourceRefsProcessingOptions.shouldIgnoreOptionalUnsatisfiedRefs'
    ),
  },
  clusterDiff: {
    clusterToLocalResourcesMatches: [],
    hasLoaded: false,
    hasFailed: false,
    hideClusterOnlyResources: true,
    selectedMatches: [],
  },
  notifications: [],
  shouldEditorReloadSelectedPath: false,
  checkedResourceIds: [],
};

const initialAppConfigState: AppConfig = {
  isStartupModalVisible: electronStore.get('appConfig.startupModalVisible'),
  kubeconfigPath: '',
  isKubeconfigPathValid: false,
  settings: {
    filterObjectsOnSelection: false,
    autoZoomGraphOnSelection: true,
    helmPreviewMode: electronStore.get('appConfig.settings.helmPreviewMode') || 'template',
    kustomizeCommand: electronStore.get('appConfig.settings.kustomizeCommand') || 'kubectl',
    theme: electronStore.get('appConfig.settings.theme'),
    textSize: electronStore.get('appConfig.settings.textSize'),
    language: electronStore.get('appConfig.settings.language'),
    loadLastFolderOnStartup: electronStore.get('appConfig.settings.loadLastFolderOnStartup'),
    hideExcludedFilesInFileExplorer: false,
  },
  scanExcludes: electronStore.get('appConfig.scanExcludes') || [],
  isScanExcludesUpdated: 'outdated',
  fileIncludes: electronStore.get('appConfig.fileIncludes') || [],
  folderReadsMaxDepth: electronStore.get('appConfig.folderReadsMaxDepth') || 10,
  recentFolders: electronStore.get('appConfig.recentFolders') || [],
  newVersion: {
    code: electronStore.get('appConfig.newVersion') || NewVersionCode.Idle,
    data: {
      initial: true,
    },
  },
  kubeConfig: {
    contexts: [],
    currentContext: undefined,
  },
  osPlatform: os.platform(),
};

const initialAlertState: AlertState = {};

const initialLogsState: LogsState = {
  logs: [''],
};

const uiLeftMenuSelection = electronStore.get('ui.leftMenu.selection');

const initialUiState: UiState = {
  isResourceFiltersOpen: false,
  isSettingsOpen: electronStore.get('ui.isSettingsOpen'),
  isClusterDiffVisible: false,
  isNotificationsOpen: electronStore.get('ui.isNotificationsOpen'),
  isFolderLoading: false,
  quickSearchActionsPopup: {
    isOpen: false,
  },
  newResourceWizard: {
    isOpen: electronStore.get('ui.isNewResourceWizardOpen'),
  },
  createFolderModal: {
    isOpen: false,
    rootDir: '',
  },
  renameResourceModal: {
    isOpen: false,
    resourceId: '',
  },
  saveResourcesToFileFolderModal: {
    isOpen: false,
    resourcesIds: [],
  },
  renameEntityModal: {
    isOpen: false,
    entityName: '',
    absolutePathToEntity: '',
  },
  leftMenu: {
    selection: uiLeftMenuSelection,
    isActive:
      !uiLeftMenuSelection || uiLeftMenuSelection.trim() === '' ? false : electronStore.get('ui.leftMenu.isActive'),
  },
  rightMenu: {
    isActive: electronStore.get('ui.rightMenu.isActive'),
  },
  folderExplorer: {
    isOpen: false,
  },
  monacoEditor: {
    focused: false,
    undo: false,
    redo: false,
    find: false,
    replace: false,
    apply: false,
    diff: false,
  },
  navPane: {
    collapsedNavSectionNames: [],
  },
  paneConfiguration: electronStore.get('ui.paneConfiguration'),
  shouldExpandAllNodes: false,
  resetLayout: false,
  isActionsPaneFooterExpanded: false,
  clusterPaneIconHighlighted: false,
  clusterStatusHidden: electronStore.get('ui.clusterStatusHidden'),
};

const initialNavigatorState: NavigatorState = {
  sectionInstanceMap: {},
  itemInstanceMap: {},
  collapsedSectionIds: [],
};

const initialUiCoachState: UiCoachState = {
  hasUserPerformedClickOnClusterIcon: false,
};

const initialExtensionState: ExtensionState = {
  isLoadingExistingPlugins: true,
  isLoadingExistingTemplates: true,
  isLoadingExistingTemplatePacks: true,
  pluginMap: {},
  templateMap: {},
  templatePackMap: {},
};

export default {
  alert: initialAlertState,
  config: initialAppConfigState,
  main: initialAppState,
  logs: initialLogsState,
  ui: initialUiState,
  navigator: initialNavigatorState,
  uiCoach: initialUiCoachState,
  extension: initialExtensionState,
};
