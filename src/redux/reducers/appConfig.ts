import {Draft, PayloadAction, createAsyncThunk, createSlice} from '@reduxjs/toolkit';

import _ from 'lodash';
import objectPath from 'object-path';
import path from 'path';

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

import {KustomizeCommandType} from '@redux/services/kustomize';
import {
  SerializableObject,
  populateProjectConfig,
  readProjectConfig,
  serializeObject,
  writeProjectConfigFile,
} from '@redux/services/projectConfig';
import {monitorProjectConfigFile} from '@redux/services/projectConfigMonitor';
import {AppDispatch} from '@redux/store';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import electronStore from '@utils/electronStore';

import initialState from '../initialState';

export const setCreateProject = createAsyncThunk('config/setCreateProject', async (project: Project, thunkAPI: any) => {
  thunkAPI.dispatch(configSlice.actions.createProject(project));
  thunkAPI.dispatch(setOpenProject(project.rootFolder));
});

export const setDeleteProject = createAsyncThunk('config/setDeleteProject', async (project: Project, thunkAPI: any) => {
  const selectedProjectRootFolder: string = thunkAPI.getState().config.selectedProjectRootFolder;
  thunkAPI.dispatch(configSlice.actions.deleteProject(project));
  if (project.rootFolder === selectedProjectRootFolder) {
    thunkAPI.dispatch(setOpenProject(null));
  }
});

export const setOpenProject = createAsyncThunk(
  'config/openProject',
  async (projectRootPath: string | null, thunkAPI: {dispatch: AppDispatch; getState: Function}) => {
    const appConfig: AppConfig = thunkAPI.getState().config;
    thunkAPI.dispatch(configSlice.actions.openProject(projectRootPath));
    thunkAPI.dispatch(setRootFolder(projectRootPath));
    const projectConfig: ProjectConfig | null = readProjectConfig(projectRootPath);
    monitorProjectConfigFile(thunkAPI.dispatch, projectRootPath);
    if (projectConfig) {
      thunkAPI.dispatch(configSlice.actions.updateProjectConfig(projectConfig));
    } else {
      thunkAPI.dispatch(configSlice.actions.updateProjectConfig(populateProjectConfig(appConfig)));
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
    updateLoadLastProjectOnStartup: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      electronStore.set('appConfig.settings.loadLastProjectOnStartup', action.payload);
      state.settings.loadLastProjectOnStartup = action.payload;
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

      project.created = new Date().toISOString();
      state.projects = _.sortBy([project, ...state.projects], (p: Project) => p.lastOpened).reverse();
      electronStore.set('appConfig.projects', state.projects);
    },
    deleteProject: (state: Draft<AppConfig>, action: PayloadAction<Project>) => {
      state.projects = _.remove(state.projects, (p: Project) => p.rootFolder !== action.payload.rootFolder);
      state.projects = _.sortBy(state.projects, (p: Project) => p.lastOpened).reverse();
      electronStore.set('appConfig.projects', state.projects);
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
    updateProjectKubeConfig: (
      state: Draft<AppConfig | SerializableObject>,
      action: PayloadAction<KubeConfig | null>
    ) => {
      if (!state.selectedProjectRootFolder) {
        return;
      }

      const serializedIncomingConfig = serializeObject(action.payload);
      const serializedState = serializeObject(state.projectConfig.kubeConfig);
      Object.keys(serializedIncomingConfig).forEach((key: string) => {
        if (
          _.isBoolean(serializedIncomingConfig[key]) &&
          !_.isEqual(serializedState[key], serializedIncomingConfig[key])
        ) {
          if (!state.projectConfig.kubeConfig) {
            state.projectConfig.kubeConfig = {};
          }
          objectPath.set(state.projectConfig.kubeConfig, key, serializedIncomingConfig[key]);
        }
        if (serializedIncomingConfig[key] && !_.isEqual(serializedState[key], serializedIncomingConfig[key])) {
          console.log('key', key);
          if (!state.projectConfig.kubeConfig) {
            state.kubeConfig = {};
          }
          objectPath.set(state.projectConfig.kubeConfig, key, serializedIncomingConfig[key]);
        }
      });
      writeProjectConfigFile(state, state.projectConfig);
    },
    updateProjectConfig: (
      state: Draft<AppConfig | SerializableObject>,
      action: PayloadAction<ProjectConfig | null>
    ) => {
      if (!state.selectedProjectRootFolder) {
        return;
      }
      const serializedIncomingConfig = serializeObject(action.payload);
      const serializedState = serializeObject(state.projectConfig);
      Object.keys(serializedIncomingConfig).forEach((key: string) => {
        if (
          _.isBoolean(serializedIncomingConfig[key]) &&
          !_.isEqual(serializedState[key], serializedIncomingConfig[key])
        ) {
          if (!state.projectConfig) {
            state.projectConfig = {};
          }
          objectPath.set(state.projectConfig, key, serializedIncomingConfig[key]);
        }
        if (serializedIncomingConfig[key] && !_.isEqual(serializedState[key], serializedIncomingConfig[key])) {
          console.log('key', key);
          if (!state.projectConfig) {
            state.projectConfig = {};
          }
          objectPath.set(state.projectConfig, key, serializedIncomingConfig[key]);
        }
      });
      writeProjectConfigFile(state, action.payload);
    },
    toggleClusterStatus: (state: Draft<AppConfig>) => {
      state.settings.isClusterSelectorVisible = !state.settings.isClusterSelectorVisible;
      electronStore.set('appConfig.settings.isClusterSelectorVisible', state.settings.isClusterSelectorVisible);
    },
    setUserDirs: (
      state: Draft<AppConfig>,
      action: PayloadAction<{homeDir: string; tempDir: string; dataDir: string}>
    ) => {
      const {homeDir, tempDir, dataDir} = action.payload;
      state.userHomeDir = homeDir;
      state.userTempDir = tempDir;
      state.userDataDir = dataDir;
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
  updateEnableHelmWithKustomize,
  updateKustomizeCommand,
  updateLoadLastProjectOnStartup,
  updateScanExcludes,
  updateStartupModalVisible,
  updateTextSize,
  updateTheme,
  setKubeConfig,
  updateProjectConfig,
  updateProjectKubeConfig,
  toggleClusterStatus,
  setUserDirs,
  createProject,
} = configSlice.actions;
export default configSlice.reducer;
