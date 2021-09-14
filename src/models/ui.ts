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
  paneConfiguration: PaneConfiguration;
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
