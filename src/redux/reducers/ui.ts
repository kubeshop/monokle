import {createSlice, Draft, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import {setRootFolder} from '@redux/thunks/setRootFolder';
import {PaneConfiguration, UiState, NewResourceWizardInput} from '@models/ui';
import initialState from '@redux/initialState';
import electronStore from '@utils/electronStore';

export const updatePaneConfiguration = createAsyncThunk(
  'ui/updatePaneConfiguration',
  async (configuration: PaneConfiguration, thunkAPI) => {
    electronStore.set('ui.paneConfiguration', configuration);
    thunkAPI.dispatch(uiSlice.actions.setPaneConfiguration(configuration));
  }
);

export const uiSlice = createSlice({
  name: 'ui',
  initialState: initialState.ui,
  reducers: {
    toggleSettings: (state: Draft<UiState>) => {
      state.isSettingsOpen = !state.isSettingsOpen;
      electronStore.set('ui.isSettingsOpen', state.isSettingsOpen);
    },
    toggleLeftMenu: (state: Draft<UiState>) => {
      state.leftMenu.isActive = !state.leftMenu.isActive;
      electronStore.set('ui.leftMenu.isActive', state.leftMenu.isActive);
    },
    setLeftMenuSelection: (state: Draft<UiState>, action: PayloadAction<string>) => {
      state.leftMenu.selection = action.payload;
      electronStore.set('ui.leftMenu.selection', state.leftMenu.selection);
    },
    toggleRightMenu: (state: Draft<UiState>) => {
      state.rightMenu.isActive = !state.rightMenu.isActive;
      electronStore.set('ui.rightMenu.isActive', state.rightMenu.isActive);
    },
    setRightMenuSelection: (state: Draft<UiState>, action: PayloadAction<string>) => {
      state.rightMenu.selection = action.payload;
      electronStore.set('ui.rightMenu.selection', state.rightMenu.selection);
    },
    setPaneConfiguration(state: Draft<UiState>, action: PayloadAction<PaneConfiguration>) {
      state.paneConfiguration = action.payload;
    },
    openNewResourceWizard: (
      state: Draft<UiState>,
      action: PayloadAction<{defaultInput?: NewResourceWizardInput} | undefined>
    ) => {
      state.newResourceWizard.isOpen = true;
      electronStore.set('ui.newResourceWizard.isOpen', state.newResourceWizard.isOpen);
      if (action.payload && action.payload.defaultInput) {
        state.newResourceWizard.defaultInput = action.payload.defaultInput;
      }
    },
    closeNewResourceWizard: (state: Draft<UiState>) => {
      state.newResourceWizard.isOpen = false;
      electronStore.set('ui.newResourceWizard.isOpen', state.newResourceWizard.isOpen);
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
    openFolderExplorer: (state: Draft<UiState>) => {
      state.folderExplorer = {isOpen: true};
    },
    closeFolderExplorer: (state: Draft<UiState>) => {
      state.folderExplorer = {isOpen: false};
    },
    setMonacoEditor: (state: Draft<UiState>, action: PayloadAction<any>) => {
      state.monacoEditor = action.payload;
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
  openFolderExplorer,
  closeFolderExplorer,
  setMonacoEditor,
} = uiSlice.actions;
export default uiSlice.reducer;
