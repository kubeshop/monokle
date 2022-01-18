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

export type LeftMenuSelection =
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
  renameResourceModal?: {
    isOpen: boolean;
    resourceId: string;
  };
  saveResourcesToFileFolderModal: {
    isOpen: boolean;
    resourcesIds: string[];
  };
  renameEntityModal: {
    isOpen: boolean;
    entityName: string;
    absolutePathToEntity: string;
  };
  isFolderLoading: boolean;
  leftMenu: {
    selection: string;
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
  clusterPaneIconHighlighted: boolean;
  clusterStatusHidden: boolean;
};

export type PaneConfiguration = {
  leftWidth: number;
  navWidth: number;
  editWidth: number;
  rightWidth: number;
};
