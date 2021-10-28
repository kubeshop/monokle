import {ResourceValidationError} from './k8sresource';

export type NewResourceWizardInput = {
  name?: string;
  kind?: string;
  apiVersion?: string;
  namespace?: string;
  selectedResourceId?: string;
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

export type UiState = {
  isSettingsOpen: boolean;
  isNotificationsOpen: boolean;
  newResourceWizard: {
    isOpen: boolean;
    defaultInput?: NewResourceWizardInput;
  };
  renameResourceModal?: {
    isOpen: boolean;
    resourceId: string;
  };
  isFolderLoading: boolean;
  leftMenu: {
    selection: string;
    isActive: boolean;
  };
  rightMenu: {
    selection?: string;
    isActive: boolean;
  };
  navPane: {
    collapsedNavSectionNames: string[];
  };
  validationErrorsModal: {
    isVisible: boolean;
    errors: ResourceValidationError[];
  };
  folderExplorer: {
    isOpen: boolean;
  };
  monacoEditor: MonacoUiState;
  paneConfiguration: PaneConfiguration;
  shouldExpandAllNodes: boolean;
  resetLayout: boolean;
};

export type PaneConfiguration = {
  leftWidth: number;
  navWidth: number;
  editWidth: number;
  rightWidth: number;
};
