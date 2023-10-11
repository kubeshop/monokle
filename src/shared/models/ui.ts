import {Project, SavedCommand, SettingsPanel} from './config';
import {K8sResource, ResourceIdentifier} from './k8sResource';

export type StartPageMenuOptions = 'projects' | 'settings' | 'new-project' | 'quick-cluster-mode' | 'learn';

export enum HighlightItems {
  CLUSTER_PANE_ICON = 'CLUSTER_PANE_ICON',
  CREATE_RESOURCE = 'CREATE_RESOURCE',
  BROWSE_TEMPLATES = 'BROWSE_TEMPLATES',
  CONNECT_TO_CLUSTER = 'CONNECT_TO_CLUSTER',
}

type LayoutSizeType = {
  header: number;
};

type LeftMenuBottomSelectionType = 'terminal';

type MonacoRange = {
  startLineNumber: number;
  endLineNumber: number;
  startColumn: number;
  endColumn: number;
};

type MonacoSelectionFile = {
  type: 'file';
  filePath: string;
  range: MonacoRange;
};

type MonacoSelectionResource = {
  type: 'resource';
  resourceId: string;
  range: MonacoRange;
};

type MonacoUiSelection = MonacoSelectionResource | MonacoSelectionFile;

type MonacoUiState = {
  focused: boolean;
  undo: boolean;
  redo: boolean;
  find: boolean;
  replace: boolean;
  apply: boolean;
  diff: boolean;
  selection?: MonacoUiSelection;
};

type NewResourceWizardInput = {
  name?: string;
  kind?: string;
  apiVersion?: string;
  namespace?: string;
  selectedResourceId?: string;
  targetFolder?: string;
  targetFile?: string;
};

export const ExplorerCollapsibleSections = ['files', 'kustomize', 'helm', 'preview-configuration', 'images'] as const;
export type ExplorerCollapsibleSectionsType = (typeof ExplorerCollapsibleSections)[number];

export const LeftMenuSelectionOptions = [
  'explorer',
  'compare',
  'validation',
  'git',
  'search',
  'settings',
  'dashboard',
  'helm',
  'helm-in-cluster',
  'cluster-validation',
  'close',
] as const;
type LeftMenuSelectionType = (typeof LeftMenuSelectionOptions)[number];

type PaneConfiguration = {
  leftPane: number;
  navPane: number;
  editPane: number;
  bottomPaneHeight: number;
};

type RightMenuSelectionType = 'logs' | 'graph';

type UiState = {
  isResourceFiltersOpen: boolean;
  isReleaseNotesDrawerOpen: boolean;
  isKeyboardShortcutsModalOpen: boolean;

  isNotificationsOpen: boolean;
  isAboutModalOpen: boolean;
  newVersionNotice: {
    isVisible: boolean;
  };
  newResourceWizard: {
    isOpen: boolean;
    defaultInput?: NewResourceWizardInput;
  };
  newAiResourceWizard: {
    isOpen: boolean;
  };
  createFileFolderModal: {
    isOpen: boolean;
    rootDir: string;
    type: 'file' | 'folder';
  };
  createProjectModal: {
    isOpen: boolean;
    fromTemplate: boolean;
  };
  renameResourceModal?: {
    isOpen: boolean;
    resourceIdentifier: ResourceIdentifier;
  };
  scaleModal: {
    isOpen: boolean;
    resource?: K8sResource;
  };
  replaceImageModal?: {
    isOpen: boolean;
    imageId: string;
  };
  saveEditCommandModal: {
    isOpen: boolean;
    command?: SavedCommand;
  };
  filtersPresetModal?: {
    isOpen: boolean;
    type: 'load' | 'save';
  };
  saveResourcesToFileFolderModal: {
    isOpen: boolean;
    resourcesIdentifiers: ResourceIdentifier[];
  };
  isStartProjectPaneVisible: boolean;
  renameEntityModal: {
    isOpen: boolean;
    entityName: string;
    absolutePathToEntity: string;
  };
  layoutSize: LayoutSizeType;
  isFolderLoading: boolean;
  leftMenu: {
    bottomSelection?: LeftMenuBottomSelectionType;
    expandedFolders: React.Key[];
    expandedSearchedFiles: React.Key[];
    isActive: boolean;
    isValidationDrawerVisible: boolean;
    selection: LeftMenuSelectionType;
    activityBeforeClusterConnect: LeftMenuSelectionType | undefined;
    activeTab: string | null;
  };
  quickSearchActionsPopup: {
    isOpen: boolean;
  };
  rightMenu: {
    selection?: RightMenuSelectionType;
    isActive: boolean;
  };
  navigator: {
    collapsedResourceKinds: string[];
  };
  folderExplorer: {
    isOpen: boolean;
  };
  kubeConfigBrowseSettings: {
    isOpen: boolean;
  };
  isActionsPaneFooterExpanded: boolean;
  monacoEditor: MonacoUiState;
  paneConfiguration: PaneConfiguration;
  resetLayout: boolean;
  activeSettingsPanel: SettingsPanel;
  startPage: {
    selectedMenuOption: StartPageMenuOptions;
    learn: {
      isVisible: boolean;
      learnTopic?: LearnTopicType;
    };
    fromBackToStart: boolean;
  };
  templateExplorer: {
    isVisible: boolean;
    selectedTemplatePath?: string;
    projectCreate?: Project;
  };
  isInQuickClusterMode?: boolean;
  /**
   * @deprecated Not used at the moment, might be needed in the future
   * */
  collapsedKustomizeKinds: string[];
  collapsedHelmCharts: string[];
  collapsedPreviewConfigurationsHelmCharts: string[];
  welcomeModal: {
    isVisible: boolean;
  };
  fileCompareModal: {
    isVisible: boolean;
    filePath: string;
  };
  explorerSelectedSection: ExplorerCollapsibleSectionsType;
  fileExplorerExpandedFolders: string[];
  showOpenProjectAlert: boolean;
  helmPane: {
    selectedMenuItem: HelmRepoMenu;
    chartSearchToken: string;
    selectedChart: null | ChartInfo;
    chartDetailsTab: HelmChartDetailsTab;
    isSearchHubIncluded: boolean;
  };
  helmRepoModal: {
    isOpen: boolean;
  };
};

type HelmRepoMenu = 'browse-charts' | 'manage-repositories' | 'manage-releases';

type HelmChartDetailsTab = 'info' | 'templates' | 'defaultValues' | 'changelog';
interface ChartInfo {
  name: string;
  url?: string;
  description: string;
  version: string;
  app_version: string;
  repository?: {name: string; url: string};
  isHubSearch?: boolean;
}

interface HelmRelease {
  name: string;
  namespace: string;
  revision: number;
  updated: string;
  status: string;
  chart: string;
  app_version: string;
}
type LearnTopicType = 'explore' | 'edit' | 'validate' | 'publish' | (string & {});

export type {
  LayoutSizeType,
  LeftMenuBottomSelectionType,
  MonacoRange,
  MonacoSelectionFile,
  MonacoSelectionResource,
  MonacoUiSelection,
  MonacoUiState,
  LeftMenuSelectionType,
  NewResourceWizardInput,
  PaneConfiguration,
  RightMenuSelectionType,
  UiState,
  LearnTopicType,
  HelmRepoMenu,
  HelmChartDetailsTab,
  ChartInfo,
  HelmRelease,
};
