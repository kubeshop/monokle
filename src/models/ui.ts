import {ResourceValidationError} from './k8sresource';

export type NewResourceWizardInput = {
  name?: string;
  kind?: string;
  apiVersion?: string;
  namespace?: string;
  selectedResourceId?: string;
};

export type UiState = {
  isSettingsOpen: boolean;
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
  monacoEditor: {
    focused: boolean;
    undo: boolean;
    redo: boolean;
    find: boolean;
    replace: boolean;
    apply: boolean;
    diff: boolean;
  };
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
