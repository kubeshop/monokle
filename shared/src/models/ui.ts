import {SettingsPanel} from './config';

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

type LeftMenuSelectionType =
  | 'file-explorer'
  | 'helm-pane'
  | 'git-pane'
  | 'kustomize-pane'
  | 'templates-pane'
  | 'images-pane'
  | 'validation-pane'
  | 'getting-started'
  | 'search'
  | 'crds';

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

type NewLeftMenuSelectionType =
  | 'explorer'
  | 'compare'
  | 'validation'
  | 'git'
  | 'search'
  | 'settings'
  | 'getting-started';

type NewResourceWizardInput = {
  name?: string;
  kind?: string;
  apiVersion?: string;
  namespace?: string;
  selectedResourceId?: string;
  targetFolder?: string;
  targetFile?: string;
};

type PaneConfiguration = {
  leftPane: number;
  navPane: number;
  editPane: number;
  bottomPaneHeight: number;
  recentProjectsPaneWidth: number;
};

type RightMenuSelectionType = 'logs' | 'graph';

type UiState = {
  isResourceFiltersOpen: boolean;
  isReleaseNotesDrawerOpen: boolean;
  isKeyboardShortcutsModalOpen: boolean;
  isScaleModalOpen: boolean;
  isSettingsOpen: boolean;
  isNotificationsOpen: boolean;
  isAboutModalOpen: boolean;
  newResourceWizard: {
    isOpen: boolean;
    defaultInput?: NewResourceWizardInput;
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
    resourceId: string;
  };
  replaceImageModal?: {
    isOpen: boolean;
    imageId: string;
  };
  filtersPresetModal?: {
    isOpen: boolean;
    type: 'load' | 'save';
  };
  saveResourcesToFileFolderModal: {
    isOpen: boolean;
    resourcesIds: string[];
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
    selection: LeftMenuSelectionType | NewLeftMenuSelectionType;
    activeTab: string | null;
  };
  quickSearchActionsPopup: {
    isOpen: boolean;
  };
  rightMenu: {
    selection?: RightMenuSelectionType;
    isActive: boolean;
  };
  navPane: {
    collapsedNavSectionNames: string[];
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
  highlightedItems: {
    clusterPaneIcon: boolean;
    createResource: boolean;
    browseTemplates: boolean;
    connectToCluster: boolean;
  };
  activeSettingsPanel?: SettingsPanel;
  walkThrough: {
    novice: {
      currentStep: number;
    };
    release: {
      currentStep: number;
    };
  };
};

export type {
  LayoutSizeType,
  LeftMenuBottomSelectionType,
  LeftMenuSelectionType,
  MonacoRange,
  MonacoSelectionFile,
  MonacoSelectionResource,
  MonacoUiSelection,
  MonacoUiState,
  NewLeftMenuSelectionType,
  NewResourceWizardInput,
  PaneConfiguration,
  RightMenuSelectionType,
  UiState,
};
