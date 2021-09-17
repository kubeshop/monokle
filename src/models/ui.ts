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
};
