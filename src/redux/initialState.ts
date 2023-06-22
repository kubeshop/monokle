import os from 'os';

import {DEFAULT_PANE_CONFIGURATION} from '@constants/constants';

import {PREDEFINED_K8S_VERSION} from '@shared/constants/k8s';
import {AlertState} from '@shared/models/alert';
import {AppState} from '@shared/models/appState';
import {AppConfig, NewVersionCode, SettingsPanel} from '@shared/models/config';
import {ExtensionState} from '@shared/models/extension';
import {TerminalState} from '@shared/models/terminal';
import {LeftMenuSelectionOptions, PaneConfiguration, UiState} from '@shared/models/ui';
import electronStore from '@shared/utils/electronStore';

const initialAppState: AppState = {
  resourceMetaMapByStorage: {
    local: {},
    cluster: {},
    preview: {},
    transient: {},
  },
  resourceContentMapByStorage: {
    local: {},
    cluster: {},
    preview: {},
    transient: {},
  },
  selection: undefined,
  selectionOptions: {},
  selectionHistory: {
    current: [],
    previous: [],
    index: 0,
  },
  highlights: [],
  previewOptions: {},
  clusterConnectionOptions: {
    lastNamespaceLoaded: electronStore.get('appConfig.lastNamespaceLoaded') || 'default',
  },
  isRehydrating: false,
  wasRehydrated: false,
  resourceFilter: {
    labels: {},
    annotations: {},
  },
  fileMap: {},
  helmChartMap: {},
  helmValuesMap: {},
  helmTemplatesMap: {},
  resourceDiff: {},
  isApplyingResource: false,
  resourceRefsProcessingOptions: {
    shouldIgnoreOptionalUnsatisfiedRefs: electronStore.get(
      'main.resourceRefsProcessingOptions.shouldIgnoreOptionalUnsatisfiedRefs',
      false
    ),
  },
  notifications: [],
  checkedResourceIdentifiers: [],
  registeredKindHandlers: [],
  prevConfEditor: {
    isOpen: false,
  },
  deviceID: electronStore.get('main.deviceID'),
  filtersPresets: electronStore.get('main.filtersPresets') || {},
  imageMap: {},
  autosaving: {},
  lastChangedLine: 0,
  activeEditorTab: 'source',
};

const initialAppConfigState: AppConfig = {
  settings: {
    filterObjectsOnSelection: false,
    autoZoomGraphOnSelection: true,
    helmPreviewMode: electronStore.get('appConfig.settings.helmPreviewMode') || 'template',
    kustomizeCommand: electronStore.get('appConfig.settings.kustomizeCommand') || 'kubectl',
    theme: electronStore.get('appConfig.settings.theme'),
    textSize: electronStore.get('appConfig.settings.textSize'),
    language: electronStore.get('appConfig.settings.language'),
    enableHelmWithKustomize: electronStore.get('appConfig.settings.enableHelmWithKustomize'),
    createDefaultObjects: electronStore.get('appConfig.settings.createDefaultObjects', false),
    setDefaultPrimitiveValues: electronStore.get('appConfig.settings.setDefaultPrimitiveValues', true),
    allowEditInClusterMode: electronStore.get('appConfig.settings.allowEditInClusterMode', true),
  },
  fileExplorerSortOrder: electronStore.get('appConfig.fileExplorerSortOrder') || 'folders',
  loadLastProjectOnStartup: electronStore.get('appConfig.loadLastProjectOnStartup'),
  scanExcludes: electronStore.get('appConfig.scanExcludes') || [],
  isScanExcludesUpdated: 'applied',
  fileIncludes: electronStore.get('appConfig.fileIncludes') || [],
  isScanIncludesUpdated: 'applied',
  folderReadsMaxDepth: electronStore.get('appConfig.folderReadsMaxDepth') || 10,
  isNewVersionAvailable: false,
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
  projects: electronStore.get('appConfig.projects') || [],
  selectedProjectRootFolder: null,
  projectConfig: null,
  isProjectLoading: true,
  projectsRootPath: electronStore.get('appConfig.projectsRootPath'),
  k8sVersion: electronStore.get('appConfig.k8sVersion') || PREDEFINED_K8S_VERSION,
  favoriteTemplates: electronStore.get('appConfig.favoriteTemplates') || [],
  disableEventTracking: electronStore.get('appConfig.disableEventTracking'),
  disableErrorReporting: electronStore.get('appConfig.disableErrorReporting'),
  isAccessLoading: false,
  kubeConfigContextsColors: electronStore.get('appConfig.kubeConfigContextsColors') || {},
  userApiKeys: electronStore.get('appConfig.userApiKeys') || {},
};

const initialAlertState: AlertState = {};

const uiLeftMenuSelection = LeftMenuSelectionOptions.includes(electronStore.get('ui.leftMenu.selection'))
  ? electronStore.get('ui.leftMenu.selection')
  : 'explorer';
const uiLeftMenuBottomSelection = electronStore.get('ui.leftMenu.bottomSelection');

let paneConfiguration: PaneConfiguration = electronStore.get('ui.paneConfiguration');

if (
  !paneConfiguration ||
  paneConfiguration.leftPane === undefined ||
  paneConfiguration.bottomPaneHeight === undefined ||
  paneConfiguration.leftPane === 0 ||
  paneConfiguration.navPane === 0
) {
  paneConfiguration = DEFAULT_PANE_CONFIGURATION;
}

const initialUiState: UiState = {
  isResourceFiltersOpen: false,
  isReleaseNotesDrawerOpen: false,
  isAboutModalOpen: false,
  isKeyboardShortcutsModalOpen: false,
  collapsedKustomizeKinds: [],
  collapsedHelmCharts: [],
  collapsedPreviewConfigurationsHelmCharts: [],

  isNotificationsOpen: false,
  isFolderLoading: false,
  quickSearchActionsPopup: {
    isOpen: false,
  },
  newResourceWizard: {
    isOpen: false,
  },
  newAiResourceWizard: {
    isOpen: false,
  },
  createFileFolderModal: {
    isOpen: false,
    rootDir: '',
    type: 'folder',
  },
  createProjectModal: {
    isOpen: false,
    fromTemplate: false,
  },
  scaleModal: {
    isOpen: false,
  },
  saveEditCommandModal: {
    isOpen: false,
  },
  isStartProjectPaneVisible: true,
  saveResourcesToFileFolderModal: {
    isOpen: false,
    resourcesIdentifiers: [],
  },
  renameEntityModal: {
    isOpen: false,
    entityName: '',
    absolutePathToEntity: '',
  },
  newVersionNotice: {
    isVisible: false,
  },
  leftMenu: {
    bottomSelection: uiLeftMenuBottomSelection,
    expandedFolders: [],
    expandedSearchedFiles: ['filter'],
    isValidationDrawerVisible: false,
    selection: uiLeftMenuSelection,
    activityBeforeClusterConnect: undefined,
    isActive:
      !uiLeftMenuSelection || uiLeftMenuSelection.trim() === '' ? false : electronStore.get('ui.leftMenu.isActive'),
    activeTab: null,
  },
  rightMenu: {
    isActive: electronStore.get('ui.rightMenu.isActive'),
  },
  kubeConfigBrowseSettings: {
    isOpen: false,
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
  navigator: {
    collapsedResourceKinds: [],
  },
  paneConfiguration,
  layoutSize: {header: 0},
  resetLayout: false,
  isActionsPaneFooterExpanded: false,
  startPage: {
    selectedMenuOption: 'new-project',
    learn: {
      isVisible: false,
    },
    fromBackToStart: false,
  },
  templateExplorer: {
    isVisible: false,
  },
  welcomeModal: {
    isVisible: false,
  },
  activeSettingsPanel: SettingsPanel.GlobalSettings,
  fileCompareModal: {
    isVisible: false,
    filePath: '',
  },
  explorerSelectedSection: 'files',
  fileExplorerExpandedFolders: [],
  showOpenProjectAlert: electronStore.get('ui.showOpenProjectAlert', true),
  helmPane: {
    selectedMenuItem: 'browse-charts',
    chartSearchToken: '',
    selectedChart: null,
    chartDetailsTab: 'info',
    isSearchHubIncluded: false,
  },
  helmRepoModal: {
    isOpen: false,
  },
};

const initialExtensionState: ExtensionState = {
  isLoadingExistingPlugins: true,
  isLoadingExistingTemplates: true,
  isLoadingExistingTemplatePacks: true,
  pluginMap: {},
  templateMap: {},
  templatePackMap: {},
};

const initialTerminalState: TerminalState = {
  settings: {
    defaultShell: electronStore.get('terminal.settings.defaultShell'),
    fontSize: electronStore.get('terminal.settings.fontSize'),
  },
  shellsMap: {},
  terminalsMap: {},
};

export default {
  alert: initialAlertState,
  config: initialAppConfigState,
  extension: initialExtensionState,
  main: initialAppState,
  terminal: initialTerminalState,
  ui: initialUiState,
};
