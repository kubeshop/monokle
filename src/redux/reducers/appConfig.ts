import {createSlice, Draft, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import {AppConfig, Themes, TextSizes, Languages} from '@models/appconfig';
import electronStore from '@utils/electronStore';
import {setShouldRefreshFileMap} from '@redux/reducers/main';
import {initialState} from '../initialState';

export const updateKubeconfig = createAsyncThunk('config/setKubeconfig', async (kubeconfig: string, thunkAPI) => {
  electronStore.set('appConfig.kubeconfig', kubeconfig);
  thunkAPI.dispatch(configSlice.actions.setKubeconfig(kubeconfig));
});

export const updateScanExcludes = createAsyncThunk('config/setKubeconfig', async (scanExcludes: string[], thunkAPI) => {
  electronStore.set('appConfig.scanExcludes', scanExcludes);
  thunkAPI.dispatch(configSlice.actions.setScanExcludes(scanExcludes));
  thunkAPI.dispatch(setShouldRefreshFileMap(true));
});

export const updateFileIncludes = createAsyncThunk('config/setKubeconfig', async (fileIncludes: string[], thunkAPI) => {
  electronStore.set('appConfig.fileIncludes', fileIncludes);
  thunkAPI.dispatch(configSlice.actions.setFileIncludes(fileIncludes));
  thunkAPI.dispatch(setShouldRefreshFileMap(true));
});

export const updateTheme = createAsyncThunk('config/setKubeconfig', async (theme: Themes, thunkAPI) => {
  electronStore.set('appConfig.settings.theme', theme);
  thunkAPI.dispatch(configSlice.actions.setTheme(theme));
});

export const updateTextSize = createAsyncThunk('config/updateTextSize', async (textSize: TextSizes, thunkAPI) => {
  electronStore.set('appConfig.settings.textSize', textSize);
  thunkAPI.dispatch(configSlice.actions.setTextSize(textSize));
});

export const updateLanguage = createAsyncThunk('config/updateLanguage', async (language: Languages, thunkAPI) => {
  electronStore.set('appConfig.settings.language', language);
  thunkAPI.dispatch(configSlice.actions.setLanguage(language));
});

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
    },
    setScanExcludes: (state: Draft<AppConfig>, action: PayloadAction<string[]>) => {
      state.scanExcludes = action.payload;
    },
    setFileIncludes: (state: Draft<AppConfig>, action: PayloadAction<string[]>) => {
      state.fileIncludes = action.payload;
    },
    setTheme: (state: Draft<AppConfig>, action: PayloadAction<Themes>) => {
      state.settings.theme = action.payload;
    },
    setTextSize: (state: Draft<AppConfig>, action: PayloadAction<TextSizes>) => {
      state.settings.textSize = action.payload;
    },
    setLanguage: (state: Draft<AppConfig>, action: PayloadAction<Languages>) => {
      state.settings.language = action.payload;
    },
  },
});

export const {setFilterObjects, setAutoZoom} = configSlice.actions;
export default configSlice.reducer;
