import {createSlice, Draft, PayloadAction} from '@reduxjs/toolkit';
import {setRootFolder} from '@redux/thunks/setRootFolder';
import {NewResourceWizardInput, UiState} from '@models/ui';
import initialState from '@redux/initialState';

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
} = uiSlice.actions;
export default uiSlice.reducer;
