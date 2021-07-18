import {createSlice, Draft, PayloadAction} from '@reduxjs/toolkit';
import {AppConfig, Themes, TextSizes, Languages} from '@models/appconfig';
import electronStore from '@utils/electronStore';
import {initialState} from '../initialState';

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
    setKubeconfig: (state: Draft<AppConfig>, action: PayloadAction<string>) => {
      state.kubeconfig = action.payload;
      electronStore.set('appConfig.kubeconfig', action.payload);
    },
    setScanExcludes: (state: Draft<AppConfig>, action: PayloadAction<string[]>) => {
      state.scanExcludes = action.payload;
      electronStore.set('appConfig.scanExcludes', action.payload);
    },
    setFileIncludes: (state: Draft<AppConfig>, action: PayloadAction<string[]>) => {
      state.fileIncludes = action.payload;
      electronStore.set('appConfig.fileIncludes', action.payload);
    },
    setTheme: (state: Draft<AppConfig>, action: PayloadAction<Themes>) => {
      state.settings.theme = action.payload;
      electronStore.set('appConfig.settings.theme', action.payload);
    },
    setTextSize: (state: Draft<AppConfig>, action: PayloadAction<TextSizes>) => {
      state.settings.textSize = action.payload;
      electronStore.set('appConfig.settings.textSize', action.payload);
    },
    setLanguage: (state: Draft<AppConfig>, action: PayloadAction<Languages>) => {
      state.settings.language = action.payload;
      electronStore.set('appConfig.settings.language', action.payload);
    },
  },
});

export const {
  setFilterObjects,
  setAutoZoom,
  setTheme,
  setTextSize,
  setLanguage,
  setScanExcludes,
  setFileIncludes,
  setKubeconfig,
} = configSlice.actions;
export default configSlice.reducer;
