export enum HighlightItems {
  CLUSTER_PANE_ICON = 'CLUSTER_PANE_ICON',
  CREATE_RESOURCE = 'CREATE_RESOURCE',
  BROWSE_TEMPLATES = 'BROWSE_TEMPLATES',
  CONNECT_TO_CLUSTER = 'CONNECT_TO_CLUSTER',
}

export type NewResourceWizardInput = {
  name?: string;
  kind?: string;
  apiVersion?: string;
  namespace?: string;
  selectedResourceId?: string;
  targetFolder?: string;
  targetFile?: string;
};

export type MonacoRange = {
  startLineNumber: number;
  endLineNumber: number;
  startColumn: number;
  endColumn: number;
};

export type MonacoSelectionResource = {
  type: 'resource';
  resourceId: string;
  range: MonacoRange;
};

export type MonacoSelectionFile = {
  type: 'file';
  filePath: string;
  range: MonacoRange;
};

export type MonacoUiSelection = MonacoSelectionResource | MonacoSelectionFile;

export type MonacoUiState = {
  focused: boolean;
  undo: boolean;
  redo: boolean;
  find: boolean;
  replace: boolean;
  apply: boolean;
  diff: boolean;
  selection?: MonacoUiSelection;
};

export type LeftMenuSelectionType =
  | 'file-explorer'
  | 'helm-pane'
  | 'kustomize-pane'
  | 'cluster-explorer'
  | 'plugin-manager'
  | 'templates-pane';

export type UiState = {
  isResourceFiltersOpen: boolean;
  isSettingsOpen: boolean;
  isClusterDiffVisible: boolean;
  isNotificationsOpen: boolean;
  newResourceWizard: {
    isOpen: boolean;
    defaultInput?: NewResourceWizardInput;
  };
  createFolderModal: {
    isOpen: boolean;
    rootDir: string;
  };
  createProjectModal: {
    isOpen: boolean;
    fromTemplate: boolean;
  };
  renameResourceModal?: {
    isOpen: boolean;
    resourceId: string;
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
  isFolderLoading: boolean;
  leftMenu: {
    selection: LeftMenuSelectionType;
    isActive: boolean;
  };
  quickSearchActionsPopup: {
    isOpen: boolean;
  };
  rightMenu: {
    selection?: string;
    isActive: boolean;
  };
  navPane: {
    collapsedNavSectionNames: string[];
  };
  folderExplorer: {
    isOpen: boolean;
  };
  isActionsPaneFooterExpanded: boolean;
  monacoEditor: MonacoUiState;
  paneConfiguration: PaneConfiguration;
  shouldExpandAllNodes: boolean;
  resetLayout: boolean;
  highlightedItems: {
    clusterPaneIcon: boolean;
    createResource: boolean;
    browseTemplates: boolean;
    connectToCluster: boolean;
  };
};

export type PaneConfiguration = {
  leftWidth: number;
  navWidth: number;
  editWidth: number;
  rightWidth: number;
};
