import {monitorKubeConfig} from '@redux/services/kubeConfigMonitor';
import {KustomizeCommandType} from '@redux/services/kustomize';
import {loadContexts} from '@redux/thunks/loadKubeConfig';
import {Draft, PayloadAction, createAsyncThunk, createSlice} from '@reduxjs/toolkit';

import {AppConfig, Languages, NewVersionCode, TextSizes, Themes} from '@models/appconfig';
import {KubeConfig} from '@models/kubeConfig';

import electronStore from '@utils/electronStore';

import initialState from '../initialState';

export const updateStartupModalVisible = createAsyncThunk(
  'config/updateStartupModalVisible',
  async (startupModalVisible: boolean, thunkAPI) => {
    electronStore.set('appConfig.startupModalVisible', startupModalVisible);
    thunkAPI.dispatch(configSlice.actions.setStartupModalVisible(startupModalVisible));
  }
);

export const updateKubeconfig = createAsyncThunk('config/updateKubeconfig', async (kubeconfig: string, thunkAPI) => {
  monitorKubeConfig(kubeconfig, thunkAPI.dispatch);
  electronStore.set('appConfig.kubeconfig', kubeconfig);
  thunkAPI.dispatch(configSlice.actions.setKubeconfig(kubeconfig));
});

export const setKubeconfigPathValidity = createAsyncThunk(
  'config/setKubeconfigPathValidity',
  async (isKubeconfigPathValid: boolean, thunkAPI) => {
    electronStore.set('appConfig.isKubeconfigPathValid', isKubeconfigPathValid);
    thunkAPI.dispatch(configSlice.actions.setKubeconfigPathValidity(isKubeconfigPathValid));
  }
);

export const updateScanExcludes = createAsyncThunk(
  'config/updateScanExcludes',
  async (scanExcludes: string[], thunkAPI) => {
    electronStore.set('appConfig.scanExcludes', scanExcludes);
    thunkAPI.dispatch(configSlice.actions.setScanExcludes(scanExcludes));
  }
);

export const updateFileIncludes = createAsyncThunk(
  'config/updateFileIncludes',
  async (fileIncludes: string[], thunkAPI) => {
    electronStore.set('appConfig.fileIncludes', fileIncludes);
    thunkAPI.dispatch(configSlice.actions.setFileIncludes(fileIncludes));
  }
);

export const updateHelmPreviewMode = createAsyncThunk(
  'config/updateHelmPreviewMode',
  async (helmPreviewMode: 'template' | 'install', thunkAPI) => {
    electronStore.set('appConfig.settings.helmPreviewMode', helmPreviewMode);
    thunkAPI.dispatch(configSlice.actions.setHelmPreviewMode(helmPreviewMode));
  }
);

export const updateKustomizeCommand = createAsyncThunk(
  'config/updateKustomizeCommand',
  async (kustomizeCommand: KustomizeCommandType, thunkAPI) => {
    electronStore.set('appConfig.settings.kustomizeCommand', kustomizeCommand);
    thunkAPI.dispatch(configSlice.actions.setKustomizeCommand(kustomizeCommand));
  }
);

export const updateLoadLastFolderOnStartup = createAsyncThunk(
  'config/updateLoadLastFolderOnStartup',
  async (autoLoad: boolean, thunkAPI) => {
    electronStore.set('appConfig.settings.loadLastFolderOnStartup', autoLoad);
    thunkAPI.dispatch(configSlice.actions.setLoadLastFolderOnStartup(autoLoad));
  }
);

export const updateHideExcludedFilesInFileExplorer = createAsyncThunk(
  'config/updateHideExcludedFilesInFileExplorer',
  async (hideExcludedFiles: boolean, thunkAPI) => {
    electronStore.set('appConfig.settings.hideExcludedFilesInFileExplorer', hideExcludedFiles);
    thunkAPI.dispatch(configSlice.actions.setHideExcludedFilesInFileExplorer(hideExcludedFiles));
  }
);

export const updateTheme = createAsyncThunk('config/updateTheme', async (theme: Themes, thunkAPI) => {
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

export const updateNewVersion = createAsyncThunk(
  'config/updateNewVersion',
  async (newVersion: {code: NewVersionCode; data: any}, thunkAPI) => {
    electronStore.set('appConfig.newVersion', newVersion.code);
    thunkAPI.dispatch(configSlice.actions.setNewVersion({code: newVersion.code, data: newVersion.data}));
  }
);

export const updateFolderReadsMaxDepth = createAsyncThunk(
  'config/folderReadsMaxDepth',
  async (maxDepth: number, thunkAPI) => {
    electronStore.set('appConfig.folderReadsMaxDepth', maxDepth);
    thunkAPI.dispatch(configSlice.actions.setFolderReadsMaxDepth(maxDepth));
  }
);

export const configSlice = createSlice({
  name: 'config',
  initialState: initialState.config,
  reducers: {
    setFilterObjects: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      state.settings.filterObjectsOnSelection = action.payload;
    },
    setAutoZoom: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      state.settings.autoZoomGraphOnSelection = action.payload;
    },
    setKubeconfig: (state: Draft<AppConfig>, action: PayloadAction<string>) => {
      state.kubeconfigPath = action.payload;
    },
    setKubeconfigPathValidity: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      state.isKubeconfigPathValid = action.payload;
    },
    setStartupModalVisible: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      state.isStartupModalVisible = action.payload;
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
    setHelmPreviewMode: (state: Draft<AppConfig>, action: PayloadAction<'template' | 'install'>) => {
      state.settings.helmPreviewMode = action.payload;
    },
    setKustomizeCommand: (state: Draft<AppConfig>, action: PayloadAction<'kubectl' | 'kustomize'>) => {
      state.settings.kustomizeCommand = action.payload;
    },
    setNewVersion: (state: Draft<AppConfig>, action: PayloadAction<{code: NewVersionCode; data: any}>) => {
      state.newVersion.code = action.payload.code;
      state.newVersion.data = {
        ...(state.newVersion.data || {}),
        ...action.payload.data,
      };
    },
    setLoadLastFolderOnStartup: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      state.settings.loadLastFolderOnStartup = action.payload;
    },
    setHideExcludedFilesInFileExplorer: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      state.settings.hideExcludedFilesInFileExplorer = action.payload;
    },
    setRecentFolders: (state: Draft<AppConfig>, action: PayloadAction<string[]>) => {
      state.recentFolders = action.payload;
    },
    setFolderReadsMaxDepth: (state: Draft<AppConfig>, action: PayloadAction<number>) => {
      state.folderReadsMaxDepth = action.payload;
    },
    setCurrentContext: (state: Draft<AppConfig>, action: PayloadAction<string>) => {
      state.kubeConfig.currentContext = action.payload;
    },
    setScanExcludesStatus: (state: Draft<AppConfig>, action: PayloadAction<'outdated' | 'applied'>) => {
      state.isScanExcludesUpdated = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadContexts.fulfilled, (state: Draft<AppConfig>, action: PayloadAction<KubeConfig>) => {
        state.kubeConfig = action.payload;
      })
      .addCase(loadContexts.rejected, state => {
        state.kubeConfig = {
          contexts: [],
          currentContext: undefined,
        };
      });
  },
});

export const {setFilterObjects, setAutoZoom, setKubeconfig, setCurrentContext, setScanExcludesStatus} =
  configSlice.actions;
export default configSlice.reducer;
