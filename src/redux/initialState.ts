import os from 'os';

import {DEFAULT_PANE_CONFIGURATION} from '@constants/constants';

import {PREDEFINED_K8S_VERSION} from '@shared/constants/k8s';
import {AlertState} from '@shared/models/alert';
import {AppState} from '@shared/models/appState';
import {AppConfig, NewVersionCode} from '@shared/models/config';
import {ExtensionState} from '@shared/models/extension';
import {NavigatorState} from '@shared/models/navigator';
import {TerminalState} from '@shared/models/terminal';
import {PaneConfiguration, UiState} from '@shared/models/ui';
import electronStore from '@shared/utils/electronStore';

const initialAppState: AppState = {
  isRehydrating: false,
  wasRehydrated: false,
  selectionHistory: [],
  previousSelectionHistory: [],
  resourceMap: {},
  resourceFilter: {
    labels: {},
    annotations: {},
  },
  fileMap: {},
  helmChartMap: {},
  helmValuesMap: {},
  helmTemplatesMap: {},
  previewLoader: {
    isLoading: false,
  },
  resourceDiff: {},
  isSelectingFile: false,
  isApplyingResource: false,
  resourceRefsProcessingOptions: {
    shouldIgnoreOptionalUnsatisfiedRefs: electronStore.get(
      'main.resourceRefsProcessingOptions.shouldIgnoreOptionalUnsatisfiedRefs',
      false
    ),
  },
  policies: {
    plugins: [],
  },
  notifications: [],
  shouldEditorReloadSelectedPath: false,
  checkedResourceIds: [],
  registeredKindHandlers: [],
  prevConfEditor: {
    isOpen: false,
  },
  deviceID: electronStore.get('main.deviceID'),
  filtersPresets: electronStore.get('main.filtersPresets') || {},
  imagesList: [],
  validationIntegration: undefined,
  autosaving: {},
  search: {
    searchQuery: '',
    replaceQuery: '',
    queryMatchParams: {
      matchCase: false,
      matchWholeWord: false,
      regExp: false,
    },
    queryTemplateParams: {
      matchCase: false,
      matchWholeWord: false,
      regExp: false,
    },
    searchHistory: electronStore.get('appConfig.recentSearch') || [],
    currentMatch: null,
  },
  lastChangedLine: 0,
  isClusterConnected: false,
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
    hideExcludedFilesInFileExplorer: electronStore.get('appConfig.settings.hideExcludedFilesInFileExplorer'),
    hideUnsupportedFilesInFileExplorer: electronStore.get('appConfig.settings.hideUnsupportedFilesInFileExplorer'),
    enableHelmWithKustomize: electronStore.get('appConfig.settings.enableHelmWithKustomize'),
    createDefaultObjects: electronStore.get('appConfig.settings.createDefaultObjects', false),
    setDefaultPrimitiveValues: electronStore.get('appConfig.settings.setDefaultPrimitiveValues', true),
    allowEditInClusterMode: electronStore.get('appConfig.settings.allowEditInClusterMode', true),
  },
  fileExplorerSortOrder: electronStore.get('appConfig.fileExplorerSortOrder') || 'folders',
  isClusterSelectorVisible: electronStore.get('appConfig.isClusterSelectorVisible', true),
  loadLastProjectOnStartup: electronStore.get('appConfig.loadLastProjectOnStartup'),
  scanExcludes: electronStore.get('appConfig.scanExcludes') || [],
  isScanExcludesUpdated: 'applied',
  fileIncludes: electronStore.get('appConfig.fileIncludes') || [],
  isScanIncludesUpdated: 'applied',
  folderReadsMaxDepth: electronStore.get('appConfig.folderReadsMaxDepth') || 10,
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
  clusterAccess: [],
  isAccessLoading: false,
  kubeConfigContextsColors: electronStore.get('appConfig.kubeConfigContextsColors') || {},
};

const initialAlertState: AlertState = {};

const uiLeftMenuSelection = electronStore.get('ui.leftMenu.selection');
const uiLeftMenuBottomSelection = electronStore.get('ui.leftMenu.bottomSelection');

let paneConfiguration: PaneConfiguration = electronStore.get('ui.paneConfiguration');

if (
  !paneConfiguration ||
  paneConfiguration.leftPane === undefined ||
  paneConfiguration.leftPane === 0 ||
  paneConfiguration.navPane === 0
) {
  paneConfiguration = DEFAULT_PANE_CONFIGURATION;
}

const initialUiState: UiState = {
  isResourceFiltersOpen: false,
  isReleaseNotesDrawerOpen: false,
  isSettingsOpen: false,
  isAboutModalOpen: false,
  isKeyboardShortcutsModalOpen: false,
  isScaleModalOpen: false,
  isNotificationsOpen: false,
  isFolderLoading: false,
  quickSearchActionsPopup: {
    isOpen: false,
  },
  newResourceWizard: {
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
  renameResourceModal: {
    isOpen: false,
    resourceId: '',
  },
  saveEditCommandModal: {
    isOpen: false,
  },
  isStartProjectPaneVisible: true,
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
    bottomSelection: uiLeftMenuBottomSelection,
    expandedFolders: [],
    expandedSearchedFiles: ['filter'],
    isValidationDrawerVisible: false,
    selection: uiLeftMenuSelection,
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
  navPane: {
    collapsedNavSectionNames: [],
  },
  paneConfiguration,
  layoutSize: {header: 0},
  resetLayout: false,
  isActionsPaneFooterExpanded: false,
  highlightedItems: {
    clusterPaneIcon: false,
    createResource: false,
    browseTemplates: false,
    connectToCluster: false,
  },
  walkThrough: {
    novice: {
      currentStep: -1,
    },
    release: {
      currentStep: -1,
    },
  },
};

const initialNavigatorState: NavigatorState = {
  sectionInstanceMap: {},
  itemInstanceMap: {},
  collapsedSectionIds: [],
  registeredSectionBlueprintIds: [],
};

const initialExtensionState: ExtensionState = {
  isLoadingExistingPlugins: true,
  isLoadingExistingTemplates: true,
  isLoadingExistingTemplatePacks: true,
  pluginMap: {},
  templateMap: {},
  templatePackMap: {},
  isPluginsDrawerVisible: false,
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
  navigator: initialNavigatorState,
  terminal: initialTerminalState,
  ui: initialUiState,
};
