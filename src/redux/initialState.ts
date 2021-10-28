import {AppState} from '@models/appstate';
import {AppConfig, NewVersionCode} from '@models/appconfig';
import {AlertState} from '@models/alert';
import {LogsState} from '@models/logs';
import {UiState} from '@models/ui';
import electronStore from '@utils/electronStore';
import {NavigatorState} from '@models/navigator';

const initialAppState: AppState = {
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
  isSelectingFile: false,
  isApplyingResource: false,
  plugins: [],
  resourceRefsProcessingOptions: {
    shouldIgnoreOptionalUnsatisfiedRefs: electronStore.get(
      'main.resourceRefsProcessingOptions.shouldIgnoreOptionalUnsatisfiedRefs'
    ),
  },
  hasNavigatorDiffLoaded: false,
  clusterToLocalResourcesMatches: [],
  notifications: [],
};

const initialAppConfigState: AppConfig = {
  isStartupModalVisible: electronStore.get('appConfig.startupModalVisible'),
  kubeconfigPath: '',
  settings: {
    filterObjectsOnSelection: false,
    autoZoomGraphOnSelection: true,
    helmPreviewMode: electronStore.get('appConfig.settings.helmPreviewMode') || 'template',
    kustomizeCommand: electronStore.get('appConfig.settings.kustomizeCommand') || 'kubectl',
    theme: electronStore.get('appConfig.settings.theme'),
    textSize: electronStore.get('appConfig.settings.textSize'),
    language: electronStore.get('appConfig.settings.language'),
    loadLastFolderOnStartup: electronStore.get('appConfig.settings.loadLastFolderOnStartup'),
  },
  scanExcludes: electronStore.get('appConfig.scanExcludes') || [],
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
};

const initialAlertState: AlertState = {};

const initialLogsState: LogsState = {
  logs: [''],
};

const initialUiState: UiState = {
  isSettingsOpen: electronStore.get('ui.isSettingsOpen'),
  isNavigatorDiffVisible: false,
  isNotificationsOpen: electronStore.get('ui.isNotificationsOpen'),
  isFolderLoading: false,
  newResourceWizard: {
    isOpen: electronStore.get('ui.isNewResourceWizardOpen'),
  },
  renameResourceModal: {
    isOpen: false,
    resourceId: '',
  },
  leftMenu: {
    selection: electronStore.get('ui.leftMenu.selection'),
    isActive: electronStore.get('ui.leftMenu.isActive'),
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
  validationErrorsModal: {
    isVisible: false,
    errors: [],
  },
  paneConfiguration: electronStore.get('ui.paneConfiguration'),
  shouldExpandAllNodes: false,
  resetLayout: false,
};

const initialNavigatorState: NavigatorState = {
  sectionInstanceMap: {},
  itemInstanceMap: {},
  collapsedSectionIds: [],
};

export default {
  alert: initialAlertState,
  config: initialAppConfigState,
  main: initialAppState,
  logs: initialLogsState,
  ui: initialUiState,
  navigator: initialNavigatorState,
};
