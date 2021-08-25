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
};
