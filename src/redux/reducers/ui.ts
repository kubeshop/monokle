import {createSlice, Draft, PayloadAction} from '@reduxjs/toolkit';
import {setRootEntry} from '@redux/thunks/setRootEntry';
import {UiState} from '@models/ui';
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
  },
  extraReducers: builder => {
    builder
      .addCase(setRootEntry.pending, state => {
        state.isFolderLoading = true;
      })
      .addCase(setRootEntry.fulfilled, state => {
        state.isFolderLoading = false;
      })
      .addCase(setRootEntry.rejected, state => {
        state.isFolderLoading = false;
      });
  },
});

export const {toggleSettings, toggleLeftMenu, toggleRightMenu, setLeftMenuSelection, setRightMenuSelection} =
  uiSlice.actions;
export default uiSlice.reducer;
