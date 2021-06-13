import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';
import { AppConfig } from '../../models/state';
import { initialState } from '../initialState';

export const configSlice = createSlice({
  name: 'config',
  initialState: initialState.appConfig,
  reducers: {
    setFilterObjects: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      state.settings.filterObjectsOnSelection = action.payload;
    },
  },
});

export const { setFilterObjects } = configSlice.actions;
export default configSlice.reducer;
