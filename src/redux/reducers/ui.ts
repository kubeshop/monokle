import {createSlice, Draft, PayloadAction} from '@reduxjs/toolkit';
import {setRootFolder} from '@redux/thunks/setRootFolder';
import {NewResourceWizardInput, UiState} from '@models/ui';
import initialState from '@redux/initialState';
import {ResourceValidationError} from '@models/k8sresource';

export const uiSlice = createSlice({
  name: 'ui',
  initialState: initialState.ui,
  reducers: {
    toggleSettings: (state: Draft<UiState>) => {
      state.isSettingsOpen = !state.isSettingsOpen;
    },
    toggleLeftMenu: (state: Draft<UiState>) => {
      state.leftMenu.isActive = !state.leftMenu.isActive;
    },
    setLeftMenuSelection: (state: Draft<UiState>, action: PayloadAction<string>) => {
      state.leftMenu.selection = action.payload;
    },
    toggleRightMenu: (state: Draft<UiState>) => {
      state.rightMenu.isActive = !state.rightMenu.isActive;
    },
    setRightMenuSelection: (state: Draft<UiState>, action: PayloadAction<string>) => {
      state.rightMenu.selection = action.payload;
    },
    openNewResourceWizard: (
      state: Draft<UiState>,
      action: PayloadAction<{defaultInput?: NewResourceWizardInput} | undefined>
    ) => {
      state.newResourceWizard.isOpen = true;
      if (action.payload && action.payload.defaultInput) {
        state.newResourceWizard.defaultInput = action.payload.defaultInput;
      }
    },
    closeNewResourceWizard: (state: Draft<UiState>) => {
      state.newResourceWizard.isOpen = false;
      state.newResourceWizard.defaultInput = undefined;
    },
    openRenameResourceModal: (state: Draft<UiState>, action: PayloadAction<string>) => {
      state.renameResourceModal = {
        isOpen: true,
        resourceId: action.payload,
      };
    },
    closeRenameResourceModal: (state: Draft<UiState>) => {
      state.renameResourceModal = undefined;
    },
    collapseNavSections: (state: Draft<UiState>, action: PayloadAction<string[]>) => {
      const expandedSections = action.payload.filter(s => !state.navPane.collapsedNavSectionNames.includes(s));
      if (expandedSections.length > 0) {
        state.navPane.collapsedNavSectionNames.push(...expandedSections);
      }
    },
    expandNavSections: (state: Draft<UiState>, action: PayloadAction<string[]>) => {
      const collapsedSections = action.payload.filter(s => state.navPane.collapsedNavSectionNames.includes(s));
      if (collapsedSections.length > 0) {
        state.navPane.collapsedNavSectionNames = state.navPane.collapsedNavSectionNames.filter(
          n => !collapsedSections.includes(n)
        );
      }
    },
    showValidationErrorsModal: (state: Draft<UiState>, action: PayloadAction<ResourceValidationError[]>) => {
      state.validationErrorsModal = {
        isVisible: true,
        errors: action.payload,
      };
    },
    hideValidationErrorsModal: (state: Draft<UiState>) => {
      state.validationErrorsModal = {
        isVisible: false,
        errors: [],
      };
    },
  },
  extraReducers: builder => {
    builder
      .addCase(setRootFolder.pending, state => {
        state.isFolderLoading = true;
      })
      .addCase(setRootFolder.fulfilled, state => {
        state.isFolderLoading = false;
      })
      .addCase(setRootFolder.rejected, state => {
        state.isFolderLoading = false;
      });
  },
});

export const {
  toggleSettings,
  toggleLeftMenu,
  toggleRightMenu,
  setLeftMenuSelection,
  setRightMenuSelection,
  openNewResourceWizard,
  closeNewResourceWizard,
  openRenameResourceModal,
  closeRenameResourceModal,
  collapseNavSections,
  expandNavSections,
  showValidationErrorsModal,
  hideValidationErrorsModal,
} = uiSlice.actions;
export default uiSlice.reducer;
