import {createSlice, Draft} from '@reduxjs/toolkit';
import {setRootFolder} from '@redux/thunks/setRootFolder';

type UiState = {
  settingsOpened: boolean;
  isFolderLoading: boolean;
};

const initialState: UiState = {
  settingsOpened: false,
  isFolderLoading: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSettings: (state: Draft<UiState>) => {
      state.settingsOpened = !state.settingsOpened;
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

export const {toggleSettings} = uiSlice.actions;
export default uiSlice.reducer;
