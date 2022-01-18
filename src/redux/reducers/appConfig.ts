import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {AppConfig, Languages, NewVersionCode, TextSizes, Themes} from '@models/appconfig';
import {KubeConfig} from '@models/kubeConfig';

import {KustomizeCommandType} from '@redux/services/kustomize';

import electronStore from '@utils/electronStore';

import initialState from '../initialState';

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
    updateKubeconfig: (state: Draft<AppConfig>, action: PayloadAction<string>) => {
      electronStore.set('appConfig.kubeconfig', action.payload);
      state.kubeconfigPath = action.payload;
    },
    setRecentFolders: (state: Draft<AppConfig>, action: PayloadAction<string[]>) => {
      state.recentFolders = action.payload;
    },
    updateKubeconfigPathValidity: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      electronStore.set('appConfig.isKubeconfigPathValid', action.payload);
      state.isKubeconfigPathValid = action.payload;
    },
    updateStartupModalVisible: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      if (!action.payload) {
        electronStore.set('appConfig.startupModalVisible', false);
      }
      state.isStartupModalVisible = action.payload;
    },
    updateScanExcludes: (state: Draft<AppConfig>, action: PayloadAction<string[]>) => {
      electronStore.set('appConfig.scanExcludes', action.payload);
      state.scanExcludes = action.payload;
    },
    updateFileIncludes: (state: Draft<AppConfig>, action: PayloadAction<string[]>) => {
      electronStore.set('appConfig.fileIncludes', action.payload);
      state.fileIncludes = action.payload;
    },
    updateTheme: (state: Draft<AppConfig>, action: PayloadAction<Themes>) => {
      electronStore.set('appConfig.settings.theme', action.payload);
      state.settings.theme = action.payload;
    },
    updateTextSize: (state: Draft<AppConfig>, action: PayloadAction<TextSizes>) => {
      electronStore.set('appConfig.settings.textSize', action.payload);
      state.settings.textSize = action.payload;
    },
    updateLanguage: (state: Draft<AppConfig>, action: PayloadAction<Languages>) => {
      electronStore.set('appConfig.settings.language', action.payload);
      state.settings.language = action.payload;
    },
    updateHelmPreviewMode: (state: Draft<AppConfig>, action: PayloadAction<'template' | 'install'>) => {
      electronStore.set('appConfig.settings.helmPreviewMode', action.payload);
      state.settings.helmPreviewMode = action.payload;
    },
    updateKustomizeCommand: (state: Draft<AppConfig>, action: PayloadAction<KustomizeCommandType>) => {
      electronStore.set('appConfig.settings.kustomizeCommand', action.payload);
      state.settings.kustomizeCommand = action.payload;
    },
    updateNewVersion: (state: Draft<AppConfig>, action: PayloadAction<{code: NewVersionCode; data: any}>) => {
      electronStore.set('appConfig.newVersion', action.payload.code);
      state.newVersion.code = action.payload.code;
      state.newVersion.data = {
        ...(state.newVersion.data || {}),
        ...action.payload.data,
      };
    },
    updateLoadLastFolderOnStartup: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      electronStore.set('appConfig.settings.loadLastFolderOnStartup', action.payload);
      state.settings.loadLastFolderOnStartup = action.payload;
    },
    updateHideExcludedFilesInFileExplorer: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      electronStore.set('appConfig.settings.hideExcludedFilesInFileExplorer', action.payload);
      state.settings.hideExcludedFilesInFileExplorer = action.payload;
    },
    updateEnableHelmWithKustomize: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      electronStore.set('appConfig.settings.enableHelmWithKustomize', action.payload);
      state.settings.enableHelmWithKustomize = action.payload;
    },
    updateFolderReadsMaxDepth: (state: Draft<AppConfig>, action: PayloadAction<number>) => {
      electronStore.set('appConfig.folderReadsMaxDepth', action.payload);
      state.folderReadsMaxDepth = action.payload;
    },
    setCurrentContext: (state: Draft<AppConfig>, action: PayloadAction<string>) => {
      state.kubeConfig.currentContext = action.payload;
    },
    setScanExcludesStatus: (state: Draft<AppConfig>, action: PayloadAction<'outdated' | 'applied'>) => {
      state.isScanExcludesUpdated = action.payload;
    },
    setContexts: (state: Draft<AppConfig>, action: PayloadAction<KubeConfig>) => {
      state.kubeConfig = action.payload;
    },
  },
});

export const {
  setFilterObjects,
  setAutoZoom,
  setCurrentContext,
  setScanExcludesStatus,
  updateKubeconfig,
  updateFolderReadsMaxDepth,
  updateLanguage,
  updateNewVersion,
  updateFileIncludes,
  updateHelmPreviewMode,
  updateHideExcludedFilesInFileExplorer,
  updateKubeconfigPathValidity,
  updateEnableHelmWithKustomize,
  updateKustomizeCommand,
  updateLoadLastFolderOnStartup,
  updateScanExcludes,
  updateStartupModalVisible,
  updateTextSize,
  updateTheme,
  setContexts,
} = configSlice.actions;
export default configSlice.reducer;
