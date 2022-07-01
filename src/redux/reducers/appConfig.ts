import {Draft, PayloadAction, createAsyncThunk, createSlice} from '@reduxjs/toolkit';

import flatten from 'flat';
import {existsSync, mkdirSync} from 'fs';
import _ from 'lodash';
import path, {join} from 'path';

import {PREDEFINED_K8S_VERSION} from '@constants/constants';

import {
  AppConfig,
  ClusterAccessWithContext,
  KubeConfig,
  Languages,
  NewVersionCode,
  Project,
  ProjectConfig,
  Settings,
  TextSizes,
  Themes,
} from '@models/appconfig';
import {UiState} from '@models/ui';

import {currentKubeContext} from '@redux/selectors';
import {
  CONFIG_PATH,
  keysToUpdateStateBulk,
  populateProjectConfig,
  readProjectConfig,
  writeProjectConfigFile,
} from '@redux/services/projectConfig';
import {monitorProjectConfigFile} from '@redux/services/projectConfigMonitor';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import electronStore from '@utils/electronStore';
import {CHANGES_BY_SETTINGS_PANEL, trackEvent} from '@utils/telemetry';

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
  async (projectRootPath: string | null, thunkAPI: any) => {
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

export const setLoadingProject = createAsyncThunk('config/loadingProject', async (loading: boolean, thunkAPI: any) => {
  thunkAPI.dispatch(configSlice.actions.setLoadingProject(loading));
});

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
    updateScanExcludes: (state: Draft<AppConfig>, action: PayloadAction<string[]>) => {
      electronStore.set('appConfig.scanExcludes', action.payload);
      state.scanExcludes = action.payload;
      state.isScanExcludesUpdated = 'outdated';
    },
    updateFileIncludes: (state: Draft<AppConfig>, action: PayloadAction<string[]>) => {
      electronStore.set('appConfig.fileIncludes', action.payload);
      state.fileIncludes = action.payload;
      state.isScanIncludesUpdated = 'outdated';
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
      electronStore.set('kubeConfig.currentContext', action.payload);
      state.kubeConfig.currentContext = action.payload;
      if (state.projectConfig) {
        state.projectConfig.isAccessLoading = true;
      }
    },
    setAccessLoading: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      if (state.projectConfig) {
        state.projectConfig.isAccessLoading = action.payload;
      }
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
      state.projects = sortProjects(state.projects, Boolean(state.selectedProjectRootFolder));
      electronStore.set('appConfig.projects', state.projects);
    },
    deleteProject: (state: Draft<AppConfig>, action: PayloadAction<Project>) => {
      state.projects = _.remove(state.projects, (p: Project) => p.rootFolder !== action.payload.rootFolder);
      state.projects = sortProjects(state.projects, Boolean(state.selectedProjectRootFolder));
      electronStore.set('appConfig.projects', state.projects);
    },
    toggleProjectPin: (state: Draft<AppConfig>, action: PayloadAction<Project>) => {
      state.projects.forEach((project: Project) => {
        if (project.rootFolder === action.payload.rootFolder) {
          project.isPinned = !project.isPinned;
        }
      });
      state.projects = sortProjects(state.projects, Boolean(state.selectedProjectRootFolder));
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

      state.projects = sortProjects(state.projects, Boolean(state.selectedProjectRootFolder));
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

      const kubeConfig = state.projectConfig?.kubeConfig;
      const serializedIncomingConfig = flatten<any, any>(action.payload);
      const serializedState = flatten<any, any>(state.projectConfig.kubeConfig);
      const keys = keysToUpdateStateBulk(serializedState, serializedIncomingConfig);

      keys.forEach(key => {
        if (kubeConfig) {
          _.set(kubeConfig, key, serializedIncomingConfig[key]);
        }
      });

      const currentLength = kubeConfig?.contexts?.length;
      const newLength = action.payload?.contexts?.length;
      // means we are updating/removing at least one of the contexts
      if (currentLength && newLength && currentLength > newLength) {
        kubeConfig?.contexts?.splice(newLength - 1, currentLength - newLength);
      }

      if (keys.length > 0 || !existsSync(CONFIG_PATH(state.selectedProjectRootFolder))) {
        writeProjectConfigFile(state);
      }
    },
    updateProjectKubeAccess: (state: Draft<AppConfig>, action: PayloadAction<ClusterAccessWithContext[]>) => {
      if (!state.selectedProjectRootFolder) {
        return;
      }

      if (!state.projectConfig) {
        state.projectConfig = {};
      }

      state.projectConfig.isAccessLoading = false;

      let updateForContext: string;
      if (!action.payload.length) {
        updateForContext = currentKubeContext(state);
      } else {
        // check that update is just for one cluster
        updateForContext = action.payload[0].context;
        const isUpdatingOneContext = action.payload.every(ca => ca.context === updateForContext);
        if (!isUpdatingOneContext) {
          return;
        }
      }

      const otherClusterAccesses =
        state.projectConfig.clusterAccess?.filter(ca => ca.context !== updateForContext) || [];

      state.projectConfig.clusterAccess = [...otherClusterAccesses, ...action.payload];
    },
    updateProjectConfig: (state: Draft<AppConfig>, action: PayloadAction<UpdateProjectConfigPayload>) => {
      if (!state.selectedProjectRootFolder) {
        return;
      }

      if (!action.payload.config) {
        state.projectConfig = {};
        return;
      }

      if (!state.projectConfig) {
        state.projectConfig = {};
      }

      const projectConfig = state.projectConfig;
      const serializedIncomingConfig = flatten<any, any>(action.payload.config);
      const serializedState = flatten<any, any>(state.projectConfig);

      let keys = keysToUpdateStateBulk(serializedState, serializedIncomingConfig);
      if (action.payload.fromConfigFile) {
        _.remove(keys, k => _.includes(['kubeConfig.contexts', 'kubeConfig.isPathValid'], k));
      }

      if (!_.isEqual(_.sortBy(state.projectConfig?.scanExcludes), _.sortBy(action.payload.config?.scanExcludes))) {
        state.isScanExcludesUpdated = 'outdated';
      }
      if (!_.isEqual(_.sortBy(state.projectConfig?.fileIncludes), _.sortBy(action.payload.config?.fileIncludes))) {
        state.isScanIncludesUpdated = 'outdated';
      }

      const cloneProjectConfig = projectConfig ? {...projectConfig} : null;

      keys.forEach(key => {
        if (projectConfig) {
          _.set(projectConfig, key, serializedIncomingConfig[key]);
          if (cloneProjectConfig && !_.isEmpty(cloneProjectConfig)) {
            trackEvent(CHANGES_BY_SETTINGS_PANEL, {type: 'project', settingKey: key});
          }
        }
      });

      if (keys.length > 0 || !existsSync(CONFIG_PATH(state.selectedProjectRootFolder))) {
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

      if (!project) {
        return;
      }

      if (project.name === action.payload) {
        return;
      }

      project.name = action.payload;
      state.selectedProjectRootFolder = project.rootFolder;
      state.projects = _.uniq([project, ...state.projects]);
      electronStore.set('appConfig.projects', state.projects);
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
          trackEvent(CHANGES_BY_SETTINGS_PANEL, {type: 'application', settingKey: key});
        }
      });

      electronStore.set('appConfig.settings', state.settings);
    },
    handleFavoriteTemplate: (state: Draft<AppConfig>, action: PayloadAction<string>) => {
      if (!state.favoriteTemplates.includes(action.payload))
        state.favoriteTemplates = [...state.favoriteTemplates, action.payload];
      else state.favoriteTemplates = state.favoriteTemplates.filter(template => template !== action.payload);
      electronStore.set('appConfig.favoriteTemplates', state.favoriteTemplates);
    },
    toggleEventTracking: (state: Draft<AppConfig>, action: PayloadAction<boolean | undefined>) => {
      if (action.payload !== undefined) {
        state.disableEventTracking = action.payload;
      } else {
        state.disableEventTracking = !state.disableEventTracking;
      }
      electronStore.set('appConfig.disableEventTracking', state.disableEventTracking);
    },
    toggleErrorReporting: (state: Draft<AppConfig>, action: PayloadAction<boolean | undefined>) => {
      if (action.payload !== undefined) {
        state.disableErrorReporting = action.payload;
      } else {
        state.disableErrorReporting = !state.disableErrorReporting;
      }
      electronStore.set('appConfig.disableErrorReporting', state.disableErrorReporting);
    },
    updateTelemetry: (
      state: Draft<AppConfig>,
      action: PayloadAction<{disableErrorReporting: boolean; disableEventTracking: boolean}>
    ) => {
      state.disableEventTracking = action.payload.disableEventTracking;
      state.disableErrorReporting = action.payload.disableErrorReporting;
      electronStore.set('appConfig.disableEventTracking', action.payload.disableEventTracking);
      electronStore.set('appConfig.disableErrorReporting', action.payload.disableErrorReporting);
    },
    addNamespaceToContext: (state: Draft<AppConfig>, action: PayloadAction<{context: string; namespace: string}>) => {
      console.log(action.payload);
      let namespaces: Array<string> | undefined = state.kubeConfig?.contexts?.find(
        c => c.name === action.payload.context
      )?.namespaces;
      if (state.kubeConfig && state.kubeConfig.contexts) {
        const context = state.kubeConfig.contexts.find(c => c.name === action.payload.context);
        if (context) {
          context.namespaces = namespaces ? [...namespaces, action.payload.namespace] : [action.payload.namespace];
        }
      }
    },
    removeNamespaceFromContext: (
      state: Draft<AppConfig>,
      action: PayloadAction<{context: string; namespace: string}>
    ) => {
      const index: number | undefined = state.kubeConfig?.contexts
        ?.find(c => c.name === action.payload.context)
        ?.namespaces.indexOf(action.payload.namespace);

      if (index && index > -1) {
        state.kubeConfig?.contexts?.find(c => c.name === action.payload.context)?.namespaces.splice(index, 1);
      }
    },
  },
  extraReducers: builder => {
    builder.addCase(setRootFolder.fulfilled, (state, action) => {
      state.isScanExcludesUpdated = action.payload.isScanIncludesUpdated;
      state.isScanIncludesUpdated = action.payload.isScanIncludesUpdated;
    });
  },
});

export const {
  setFilterObjects,
  setAutoZoom,
  setCurrentContext,
  updateFolderReadsMaxDepth,
  updateLanguage,
  updateNewVersion,
  updateFileIncludes,
  updateLoadLastProjectOnStartup,
  updateScanExcludes,
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
  updateProjectKubeAccess,
  updateK8sVersion,
  handleFavoriteTemplate,
  toggleEventTracking,
  toggleErrorReporting,
  setAccessLoading,
  updateTelemetry,
  toggleProjectPin,
  addNamespaceToContext,
  removeNamespaceFromContext,
} = configSlice.actions;
export default configSlice.reducer;

export const sortProjects = (projects: Array<Project>, isAnyProjectOpened: boolean) => {
  if (projects.length === 0) {
    return [];
  }

  const sortedProjects = _.sortBy(projects, (p: Project) => p.lastOpened).reverse();
  if (!isAnyProjectOpened) {
    return _.sortBy(sortedProjects, (p: Project) => !p.isPinned);
  }

  const [lastOpened, ...rest] = sortedProjects;
  return [lastOpened, ..._.sortBy(rest, (p: Project) => !p.isPinned)];
};
