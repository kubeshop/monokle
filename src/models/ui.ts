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
  rightWidth: number;
  editWidth: number;
  separatorEditRightXPosition?: number;
  separatorLeftNavXPosition?: number;
  separatorNavEditXPosition?: number;
};
