import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';
import { initialState } from '../initialState';
import { AppConfig } from '../../models/appconfig';

export const configSlice = createSlice({
  name: 'config',
  initialState: initialState.appConfig,
  reducers: {
    setFilterObjects: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      state.settings.filterObjectsOnSelection = action.payload;
    },
    setAutoZoom: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      state.settings.autoZoomGraphOnSelection = action.payload;
    },
  },
});

export const { setFilterObjects, setAutoZoom } = configSlice.actions;
export default configSlice.reducer;
