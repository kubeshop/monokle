import {createSlice, Draft, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import {setRootFolder} from '@redux/thunks/setRootFolder';
import {UiState} from '@models/ui';
import initialState from '@redux/initialState';
import electronStore from '@utils/electronStore';

export const updateLeftWidth = createAsyncThunk('ui/updateLeftWidth', async (width: number, thunkAPI) => {
  electronStore.set('ui.paneConfiguration.leftWidth', width);
  thunkAPI.dispatch(uiSlice.actions.setLeftWidth(width));
});

export const updateNavWidth = createAsyncThunk('ui/updateNavWidth', async (width: number, thunkAPI) => {
  electronStore.set('ui.paneConfiguration.navWidth', width);
  thunkAPI.dispatch(uiSlice.actions.setNavWidth(width));
});

export const updateEditWidth = createAsyncThunk('ui/updateEditWidth', async (width: number, thunkAPI) => {
  electronStore.set('ui.paneConfiguration.editWidth', width);
  thunkAPI.dispatch(uiSlice.actions.setEditWidth(width));
});

export const updateRightWidth = createAsyncThunk('ui/updateRightWidth', async (width: number, thunkAPI) => {
  electronStore.set('ui.paneConfiguration.rightWidth', width);
  thunkAPI.dispatch(uiSlice.actions.setRightWidth(width));
});

export const updateSeparatorEditRightXPosition = createAsyncThunk(
  'ui/updateSeparatorEditRightXPosition',
  async (position: number, thunkAPI) => {
    electronStore.set('ui.paneConfiguration.separatorEditRightXPosition', position);
    thunkAPI.dispatch(uiSlice.actions.setSeparatorEditRightXPosition(position));
  }
);

export const updateSeparatorLeftNavXPosition = createAsyncThunk(
  'ui/updateseparatorLeftNavXPosition',
  async (position: number, thunkAPI) => {
    electronStore.set('ui.paneConfiguration.separatorLeftNavXPosition', position);
    thunkAPI.dispatch(uiSlice.actions.setSeparatorLeftNavXPosition(position));
  }
);

export const updateSeparatorNavEditXPosition = createAsyncThunk(
  'ui/updateSeparatorNavEditXPosition',
  async (position: number, thunkAPI) => {
    electronStore.set('ui.paneConfiguration.separatorNavEditXPosition', position);
    thunkAPI.dispatch(uiSlice.actions.setSeparatorNavEditXPosition(position));
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
    openNewResourceWizard: (state: Draft<UiState>) => {
      state.isNewResourceWizardOpen = true;
      electronStore.set('ui.isNewResourceWizardOpen', state.isNewResourceWizardOpen);
    },
    closeNewResourceWizard: (state: Draft<UiState>) => {
      state.isNewResourceWizardOpen = false;
      electronStore.set('ui.isNewResourceWizardOpen', state.isNewResourceWizardOpen);
    },
    setLeftWidth(state: Draft<UiState>, action: PayloadAction<number>) {
      state.paneConfiguration.leftWidth = action.payload;
    },
    setNavWidth(state: Draft<UiState>, action: PayloadAction<number>) {
      state.paneConfiguration.navWidth = action.payload;
    },
    setEditWidth(state: Draft<UiState>, action: PayloadAction<number>) {
      state.paneConfiguration.editWidth = action.payload;
    },
    setRightWidth(state: Draft<UiState>, action: PayloadAction<number>) {
      state.paneConfiguration.rightWidth = action.payload;
    },
    setSeparatorEditRightXPosition(state: Draft<UiState>, action: PayloadAction<number>) {
      state.paneConfiguration.separatorEditRightXPosition = action.payload;
    },
    setSeparatorLeftNavXPosition(state: Draft<UiState>, action: PayloadAction<number>) {
      state.paneConfiguration.separatorLeftNavXPosition = action.payload;
    },
    setSeparatorNavEditXPosition(state: Draft<UiState>, action: PayloadAction<number>) {
      state.paneConfiguration.separatorNavEditXPosition = action.payload;
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
} = uiSlice.actions;
export default uiSlice.reducer;
