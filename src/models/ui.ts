export type UiState = {
  isSettingsOpen: boolean;
  isNewResourceWizardOpen: boolean;
  isFolderLoading: boolean;
  leftMenu: {
    selection: string;
    isActive: boolean;
  };
  rightMenu: {
    selection?: string;
    isActive: boolean;
  };
  paneConfiguration: {
    leftWidth: number;
    navWidth: number;
    rightWidth: number;
    editWidth: number;
    separatorEditRightXPosition?: number;
    separatorLeftNavXPosition?: number;
    separatorNavEditXPosition?: number;
  };
};
