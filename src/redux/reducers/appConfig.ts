import {Draft, PayloadAction, createAsyncThunk, createSlice} from '@reduxjs/toolkit';

import {readFileSync, writeFileSync} from 'fs';
import _ from 'lodash';
import path, {sep} from 'path';

import {
  AppConfig,
  KubeConfig,
  Languages,
  NewVersionCode,
  Project,
  ProjectConfig,
  TextSizes,
  Themes,
} from '@models/appconfig';

import {mergeConfigs, populateProjectConfig} from '@redux/selectors';
import {KustomizeCommandType} from '@redux/services/kustomize';
import {monitorProjectConfigFile} from '@redux/services/projectConfigMonitor';
import {AppDispatch} from '@redux/store';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import electronStore from '@utils/electronStore';

import initialState from '../initialState';

export const setCreateProject = createAsyncThunk('config/setCreateProject', async (project: Project, thunkAPI: any) => {
  thunkAPI.dispatch(configSlice.actions.createProject(project));
  thunkAPI.dispatch(setOpenProject(project.rootFolder));
});

export const setOpenProject = createAsyncThunk(
  'config/openProject',
  async (projectRootPath: string | null, thunkAPI: {dispatch: AppDispatch; getState: Function}) => {
    thunkAPI.dispatch(configSlice.actions.openProject(projectRootPath));
    thunkAPI.dispatch(setRootFolder(projectRootPath));
    thunkAPI.dispatch(configSlice.actions.setProjectConfig(null));
    monitorProjectConfigFile(thunkAPI.dispatch, projectRootPath);
  }
);

export const updateProjectKubeConfig = createAsyncThunk(
  'config/updateProjectKubeConfig',
  async (kubeConfig: KubeConfig, thunkAPI: any) => {
    const projectConfig: ProjectConfig | null = thunkAPI.getState().config.projectConfig;

    if (!_.isEqual(projectConfig?.kubeConfig, kubeConfig)) {
      thunkAPI.dispatch(
        configSlice.actions.updateProjectConfig({
          ...projectConfig,
          kubeConfig: {...projectConfig?.kubeConfig, ...kubeConfig},
        })
      );
    }
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
    setRecentFolders: (state: Draft<AppConfig>, action: PayloadAction<string[]>) => {
      state.recentFolders = action.payload;
    },
    updateStartupModalVisible: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      electronStore.set('appConfig.startupModalVisible', action.payload);
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
    updateLoadLastProjectOnStartup: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      electronStore.set('appConfig.settings.loadLastFolderOnStartup', action.payload);
      state.settings.loadLastProjectOnStartup = action.payload;
    },
    updateHideExcludedFilesInFileExplorer: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      electronStore.set('appConfig.settings.hideExcludedFilesInFileExplorer', action.payload);
      state.settings.hideExcludedFilesInFileExplorer = action.payload;
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
    setKubeConfig: (state: Draft<AppConfig>, action: PayloadAction<KubeConfig>) => {
      state.kubeConfig = {...state.kubeConfig, ...action.payload};
    },
    createProject: (state: Draft<AppConfig>, action: PayloadAction<Project>) => {
      const project: Project = action.payload;
      const existingProject: Project | undefined = state.projects.find(
        (p: Project) => p.rootFolder === project.rootFolder
      );

      if (existingProject) {
        return;
      }

      if (!project.name) {
        const folderNames: string[] = project.rootFolder.split(path.sep);
        project.name = folderNames[folderNames.length - 1];
      }

      state.projects = [project, ...state.projects];
      state.selectedProjectRootFolder = project.rootFolder;
    },
    openProject: (state: Draft<AppConfig>, action: PayloadAction<string | null>) => {
      const projectRootPath: string | null = action.payload;

      if (!projectRootPath) {
        state.selectedProjectRootFolder = null;
        return;
      }

      const project: Project | undefined = state.projects.find((p: Project) => p.rootFolder === projectRootPath);

      if (project) {
        state.selectedProjectRootFolder = projectRootPath;
        project.lastOpened = new Date().toISOString();
      }

      state.projects = _.sortBy(state.projects, (p: Project) => p.lastOpened).reverse();
      electronStore.set('appConfig.projects', state.projects);
    },
    setProjectConfig: (state: Draft<AppConfig>, action: PayloadAction<ProjectConfig | null>) => {
      state.projectConfig = action.payload;
    },
    updateProjectConfig: (state: Draft<AppConfig>, action: PayloadAction<ProjectConfig | null>) => {
      if (!state.selectedProjectRootFolder) {
        return;
      }

      if (_.isEqual(state.projectConfig, action.payload)) {
        return;
      }

      const absolutePath = `${state.selectedProjectRootFolder}${sep}.monokle`;

      const applicationConfig: ProjectConfig = populateProjectConfig(state);
      if (!_.isEqual(state.projectConfig, action.payload)) {
        const mergedConfigs = mergeConfigs(applicationConfig, action.payload);
        delete mergedConfigs?.settings?.loadLastProjectOnStartup;
        delete mergedConfigs?.kubeConfig?.isPathValid;
        delete mergedConfigs?.kubeConfig?.contexts;
        if (mergedConfigs && !_.isEmpty(mergedConfigs)) {
          try {
            const savedConfig: ProjectConfig = JSON.parse(readFileSync(absolutePath, 'utf8'));
            if (!_.isEqual(savedConfig, mergedConfigs)) {
              writeFileSync(absolutePath, JSON.stringify(mergedConfigs, null, 4), 'utf-8');
            }
          } catch (error: any) {
            writeFileSync(absolutePath, JSON.stringify(mergedConfigs, null, 4), 'utf-8');
          }
        } else {
          writeFileSync(absolutePath, ``, 'utf-8');
        }

        state.projectConfig = action.payload;
      }
    },
    toggleClusterStatus: (state: Draft<AppConfig>) => {
      state.settings.isClusterSelectorVisible = !state.settings.isClusterSelectorVisible;
      electronStore.set('ui.clusterStatusHidden', state.settings.isClusterSelectorVisible);
    },
  },
});

export const {
  setFilterObjects,
  setAutoZoom,
  setCurrentContext,
  setScanExcludesStatus,
  updateFolderReadsMaxDepth,
  updateLanguage,
  updateNewVersion,
  updateFileIncludes,
  updateHelmPreviewMode,
  updateHideExcludedFilesInFileExplorer,
  updateKustomizeCommand,
  updateLoadLastProjectOnStartup,
  updateScanExcludes,
  updateStartupModalVisible,
  updateTextSize,
  updateTheme,
  setKubeConfig,
  updateProjectConfig,
  toggleClusterStatus,
} = configSlice.actions;
export default configSlice.reducer;
