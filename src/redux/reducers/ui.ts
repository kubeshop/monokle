import {createSlice, Draft} from '@reduxjs/toolkit';

type UiState = {
  settingsOpened: boolean;
};

const initialState: UiState = {
  settingsOpened: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSettings: (state: Draft<UiState>) => {
      state.settingsOpened = !state.settingsOpened;
    },
  },
});

export const {toggleSettings} = uiSlice.actions;
export default uiSlice.reducer;
