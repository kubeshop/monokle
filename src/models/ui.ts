import {SettingsPanel} from '@organisms/SettingsManager/types';

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
  | 'templates-pane'
  | 'docker-images-pane';
export type RightMenuSelectionType = 'logs' | 'graph';

export type LayoutSizeType = {
  footer: number;
  header: number;
};

export type UiState = {
  isResourceFiltersOpen: boolean;
  isReleaseNotesDrawerOpen: boolean;
  isKeyboardShortcutsModalOpen: boolean;
  isSettingsOpen: boolean;
  isClusterDiffVisible: boolean;
  isNotificationsOpen: boolean;
  isAboutModalOpen: boolean;
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
  replaceImageModal?: {
    isOpen: boolean;
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
    selection: LeftMenuSelectionType;
    isActive: boolean;
    expandedFolders: React.Key[];
    isValidationDrawerVisible: boolean;
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

export type PaneConfiguration = {
  leftPane: number;
  navPane: number;
  rightPane: number;
  actionsPaneFooterExpandedHeight: number;
  recentProjectsPaneWidth: number;
};
