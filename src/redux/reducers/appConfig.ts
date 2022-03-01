import {Draft, PayloadAction, createAsyncThunk, createSlice} from '@reduxjs/toolkit';

import flatten from 'flat';
import {existsSync, mkdirSync} from 'fs';
import _ from 'lodash';
import path, {join} from 'path';

import {PREDEFINED_K8S_VERSION} from '@constants/constants';

import {
  AppConfig,
  KubeConfig,
  Languages,
  NewVersionCode,
  Project,
  ProjectConfig,
  Settings,
  TextSizes,
  Themes,
} from '@models/appconfig';
import {AppDispatch} from '@models/appdispatch';
import {UiState} from '@models/ui';

import {
  keysToUpdateStateBulk,
  populateProjectConfig,
  readProjectConfig,
  writeProjectConfigFile,
} from '@redux/services/projectConfig';
import {monitorProjectConfigFile} from '@redux/services/projectConfigMonitor';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import electronStore from '@utils/electronStore';

import initialState from '../initialState';
import {toggleStartProjectPane} from './ui';

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
  'config/setOpenProject',
  async (projectRootPath: string | null, thunkAPI: {dispatch: AppDispatch; getState: Function}) => {
    const appConfig: AppConfig = thunkAPI.getState().config;
    const appUi: UiState = thunkAPI.getState().ui;
    if (projectRootPath && appUi.isStartProjectPaneVisible) {
      thunkAPI.dispatch(toggleStartProjectPane());
    }

    const projectConfig: ProjectConfig | null = readProjectConfig(projectRootPath);
    monitorProjectConfigFile(thunkAPI.dispatch, projectRootPath);
    // First open the project so state.selectedProjectRootFolder is set
    thunkAPI.dispatch(configSlice.actions.openProject(projectRootPath));
    const config: ProjectConfig | null = projectConfig || populateProjectConfig(appConfig);

    if (
      projectConfig &&
      !(
        projectConfig.k8sVersion &&
        existsSync(join(String(appConfig.userDataDir), path.sep, 'schemas', `${projectConfig?.k8sVersion}.json`))
      )
    ) {
      projectConfig.k8sVersion = PREDEFINED_K8S_VERSION;
    }
    // Then set project config by reading .monokle or populating it
    thunkAPI.dispatch(configSlice.actions.updateProjectConfig({config, fromConfigFile: false}));
    // Last set rootFolder so function can read the latest projectConfig
    thunkAPI.dispatch(setRootFolder(projectRootPath));
  }
);

export const setLoadingProject = createAsyncThunk(
  'config/loadingProject',
  async (loading: boolean, thunkAPI: {dispatch: AppDispatch; getState: Function}) => {
    thunkAPI.dispatch(configSlice.actions.setLoadingProject(loading));
  }
);

type UpdateProjectConfigPayload = {config: ProjectConfig | null; fromConfigFile: boolean};

export const configSlice = createSlice({
  name: 'config',
  initialState: initialState.config,
  reducers: {
    setFilterObjects: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      state.settings.filterObjectsOnSelection = action.payload;
    },
    setLoadingProject: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      state.isProjectLoading = action.payload;
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
    updateNewVersion: (state: Draft<AppConfig>, action: PayloadAction<{code: NewVersionCode; data: any}>) => {
      electronStore.set('appConfig.newVersion', action.payload.code);
      state.newVersion.code = action.payload.code;
      state.newVersion.data = {
        ...(state.newVersion.data || {}),
        ...action.payload.data,
      };
    },
    updateLoadLastProjectOnStartup: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      electronStore.set('appConfig.loadLastProjectOnStartup', action.payload);
      state.loadLastProjectOnStartup = action.payload;
    },
    updateClusterSelectorVisibilty: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      electronStore.set('appConfig.isClusterSelectorVisible', action.payload);
      state.isClusterSelectorVisible = action.payload;
    },
    updateFolderReadsMaxDepth: (state: Draft<AppConfig>, action: PayloadAction<number>) => {
      electronStore.set('appConfig.folderReadsMaxDepth', action.payload);
      state.folderReadsMaxDepth = action.payload;
    },
    updateK8sVersion: (state: Draft<AppConfig>, action: PayloadAction<string>) => {
      electronStore.set('appConfig.k8sVersion', action.payload);
      state.k8sVersion = action.payload;
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

      if (!existsSync(project.rootFolder)) {
        mkdirSync(project.rootFolder, {recursive: true});
      }

      if (!project.name) {
        const folderNames: string[] = project.rootFolder.split(path.sep);
        project.name = folderNames[folderNames.length - 1];
      }

      project.created = new Date().toISOString();
      state.projects = _.sortBy(
        [project, ...state.projects],
        (p: Project) => p.lastOpened || new Date(-8640000000000000).toISOString()
      ).reverse();
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
    updateProjectKubeConfig: (state: Draft<AppConfig>, action: PayloadAction<KubeConfig | null>) => {
      if (!state.selectedProjectRootFolder) {
        return;
      }

      if (!state.projectConfig) {
        state.projectConfig = {};
      }

      if (!state.projectConfig.kubeConfig) {
        state.projectConfig.kubeConfig = {};
      }

      const serializedIncomingConfig = flatten<any, any>(action.payload);
      const serializedState = flatten<any, any>(state.projectConfig.kubeConfig);
      const keys = keysToUpdateStateBulk(serializedState, serializedIncomingConfig);

      keys.forEach(key => {
        const kubeConfig = state.projectConfig?.kubeConfig;
        if (kubeConfig) {
          _.set(kubeConfig, key, serializedIncomingConfig[key]);
        }
      });

      if (keys.length > 0) {
        writeProjectConfigFile(state);
      }
    },
    updateProjectConfig: (state: Draft<AppConfig>, action: PayloadAction<UpdateProjectConfigPayload>) => {
      if (!state.selectedProjectRootFolder) {
        return;
      }

      if (!state.projectConfig) {
        state.projectConfig = {};
      }

      const serializedIncomingConfig = flatten<any, any>(action.payload.config);
      const serializedState = flatten<any, any>(state.projectConfig);
      let keys = keysToUpdateStateBulk(serializedState, serializedIncomingConfig);

      if (action.payload.fromConfigFile) {
        _.remove(keys, k => _.includes(['kubeConfig.contexts', 'kubeConfig.isPathValid'], k));
      }

      keys.forEach(key => {
        const projectConfig = state.projectConfig;
        if (projectConfig) {
          _.set(projectConfig, key, serializedIncomingConfig[key]);
        }
      });

      if (keys.length > 0) {
        writeProjectConfigFile(state);
      }
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
    changeCurrentProjectName: (state: Draft<AppConfig>, action: PayloadAction<string>) => {
      if (!state.selectedProjectRootFolder) {
        return;
      }
      const project: Project | undefined = state.projects.find(
        (p: Project) => p.rootFolder === state.selectedProjectRootFolder
      );

      if (project) {
        project.name = action.payload;
        state.selectedProjectRootFolder = project.rootFolder;
        state.projects = _.uniq([project, ...state.projects]);
        electronStore.set('appConfig.projects', state.projects);
      }
    },
    changeProjectsRootPath: (state: Draft<AppConfig>, action: PayloadAction<string>) => {
      state.projectsRootPath = action.payload;
      electronStore.set('appConfig.projectsRootPath', state.projectsRootPath);
    },
    updateApplicationSettings: (state: Draft<AppConfig>, action: PayloadAction<Settings | null | undefined>) => {
      if (!state.settings) {
        state.settings = {};
      }

      const serializedIncomingSettings = flatten<any, any>(action.payload);
      const serializedState = flatten<any, any>(state.settings);
      let keys = keysToUpdateStateBulk(serializedState, serializedIncomingSettings);

      keys.forEach(key => {
        const projectSettings = state.settings;
        if (projectSettings) {
          _.set(projectSettings, key, serializedIncomingSettings[key]);
        }
      });

      electronStore.set('appConfig.settings', state.settings);
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
  updateLoadLastProjectOnStartup,
  updateScanExcludes,
  updateStartupModalVisible,
  updateTextSize,
  updateTheme,
  setKubeConfig,
  updateProjectConfig,
  updateProjectKubeConfig,
  updateClusterSelectorVisibilty,
  setUserDirs,
  createProject,
  changeCurrentProjectName,
  changeProjectsRootPath,
  updateApplicationSettings,
  updateK8sVersion,
} = configSlice.actions;
export default configSlice.reducer;
