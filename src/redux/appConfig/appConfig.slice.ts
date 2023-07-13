import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import flatten from 'flat';
import {existsSync, mkdirSync} from 'fs';
import _ from 'lodash';
import log from 'loglevel';
import path from 'path';

import {CONFIG_PATH, keysToDelete, keysToUpdateStateBulk, writeProjectConfigFile} from '@redux/services/projectConfig';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {init as sentryInit} from '@sentry/electron/renderer';
import {SKIPPED_ERRORS} from '@shared/constants/sentry';
import {ClusterColors} from '@shared/models/cluster';
import {
  ApiKeyVendor,
  AppConfig,
  FileExplorerSortOrder,
  KubeConfig,
  Languages,
  NewVersionCode,
  Project,
  ProjectConfig,
  Settings,
  TextSizes,
  Themes,
} from '@shared/models/config';
import electronStore from '@shared/utils/electronStore';
import {isEqual} from '@shared/utils/isEqual';

import initialState from '../initialState';

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
    },
    setAccessLoading: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      state.isAccessLoading = action.payload;
    },
    setKubeConfig: (state: Draft<AppConfig>, action: PayloadAction<KubeConfig>) => {
      const changed = !isEqual(action.payload, state.kubeConfig);
      const pathChanged = action.payload.path !== state.kubeConfig.path;
      if (!changed) return;
      state.kubeConfig = action.payload;

      if (pathChanged) {
        electronStore.set('appConfig.kubeConfig', action.payload.path);
      }
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
    updateProjectsGitRepo: (state: Draft<AppConfig>, action: PayloadAction<{path: string; isGitRepo: boolean}[]>) => {
      action.payload.forEach(project => {
        const foundProject = state.projects.find(p => p.rootFolder === project.path);

        if (!foundProject) {
          return;
        }

        foundProject.isGitRepo = project.isGitRepo;
      });

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
    loadProjectKubeConfig: (state: Draft<AppConfig>, action: PayloadAction<KubeConfig | null>) => {
      const changed = !isEqual(action.payload, state.projectConfig?.kubeConfig);
      if (!changed) return;

      if (!state.projectConfig) {
        state.projectConfig = {};
      }

      if (!state.projectConfig.kubeConfig) {
        state.projectConfig.kubeConfig = {};
      }

      state.projectConfig.kubeConfig = {
        ...state.projectConfig.kubeConfig,
        ...action.payload,
      };
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
      const incomingConfigKeys = Object.keys(action.payload.config);
      const serializedIncomingConfig = flatten<any, any>(action.payload.config, {safe: true});
      const serializedState = flatten<any, any>(state.projectConfig, {safe: true});

      let keys = keysToUpdateStateBulk(serializedState, serializedIncomingConfig);
      let deletedKeys = keysToDelete(serializedState, serializedIncomingConfig, incomingConfigKeys);

      if (action.payload.fromConfigFile) {
        _.remove(keys, k => _.includes(['kubeConfig.contexts', 'kubeConfig.isPathValid'], k));
      }

      if (!isEqual(_.sortBy(state.projectConfig?.scanExcludes), _.sortBy(action.payload.config?.scanExcludes))) {
        state.isScanExcludesUpdated = 'outdated';
      }
      if (!isEqual(_.sortBy(state.projectConfig?.fileIncludes), _.sortBy(action.payload.config?.fileIncludes))) {
        state.isScanIncludesUpdated = 'outdated';
      }

      if (projectConfig) {
        keys.forEach(key => {
          _.set(projectConfig, key, serializedIncomingConfig[key]);
        });

        deletedKeys.forEach(key => {
          _.unset(projectConfig, key);
        });
      }

      if (action.payload?.config?.kubeConfig && !action.payload.fromConfigFile) {
        state.projectConfig.kubeConfig = {
          ...state.projectConfig.kubeConfig,
          ...action.payload.config.kubeConfig,
        };
      }

      if (action.payload?.config?.helm && !action.payload.fromConfigFile) {
        state.projectConfig.helm = {
          ...state.projectConfig.helm,
          ...action.payload.config.helm,
        };
      }

      if (
        !action.payload.fromConfigFile &&
        (keys.length > 0 || deletedKeys.length > 0 || !existsSync(CONFIG_PATH(state.selectedProjectRootFolder)))
      ) {
        writeProjectConfigFile(state);
      }
    },
    updateProjectK8sVersion: (state: Draft<AppConfig>, action: PayloadAction<string>) => {
      if (state.selectedProjectRootFolder && state.projectConfig) {
        state.projectConfig.k8sVersion = action.payload;
        writeProjectConfigFile(state);
      }
    },
    setUserDirs: (
      state: Draft<AppConfig>,
      action: PayloadAction<{homeDir: string; tempDir: string; dataDir: string; crdsDir: string}>
    ) => {
      const {homeDir, tempDir, dataDir, crdsDir} = action.payload;
      state.userHomeDir = homeDir;
      state.userTempDir = tempDir;
      state.userDataDir = dataDir;
      state.userCrdsDir = crdsDir;
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

      const serializedIncomingSettings = flatten<any, any>(action.payload, {safe: true});
      const serializedState = flatten<any, any>(state.settings, {safe: true});
      let keys = keysToUpdateStateBulk(serializedState, serializedIncomingSettings);

      keys.forEach(key => {
        const projectSettings = state.settings;
        if (projectSettings) {
          _.set(projectSettings, key, serializedIncomingSettings[key]);
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
    setEventTracking: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      state.disableEventTracking = action.payload;
    },
    toggleErrorReporting: (state: Draft<AppConfig>, action: PayloadAction<boolean | undefined>) => {
      if (action.payload !== undefined) {
        state.disableErrorReporting = action.payload;
      } else {
        state.disableErrorReporting = !state.disableErrorReporting;
      }
      electronStore.set('appConfig.disableErrorReporting', state.disableErrorReporting);
    },
    setKubeConfigContextColor: (
      state: Draft<AppConfig>,
      action: PayloadAction<{color: ClusterColors; name: string}>
    ) => {
      const {color, name} = action.payload;

      state.kubeConfigContextsColors[name] = color;
      electronStore.set('appConfig.kubeConfigContextsColors', state.kubeConfigContextsColors);
    },
    setIsNewVersionAvailable: (state: Draft<AppConfig>, action: PayloadAction<boolean>) => {
      state.isNewVersionAvailable = action.payload;
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
    updateFileExplorerSortOrder: (state: Draft<AppConfig>, action: PayloadAction<FileExplorerSortOrder>) => {
      state.fileExplorerSortOrder = action.payload;
      electronStore.set('appConfig.fileExplorerSortOrder', action.payload);
    },

    toggleEditorPlaceholderVisiblity: (state: Draft<AppConfig>, action: PayloadAction<boolean | undefined>) => {
      if (action.payload !== undefined && state.projectConfig && state.projectConfig.settings) {
        state.projectConfig.settings.hideEditorPlaceholder = action.payload;
      } else if (state.projectConfig && state.projectConfig.settings) {
        state.projectConfig.settings.hideEditorPlaceholder = !state.projectConfig.settings.hideEditorPlaceholder;
      }
    },
    initRendererSentry: (state: Draft<AppConfig>, action: PayloadAction<{SENTRY_DSN: string}>) => {
      try {
        sentryInit({
          dsn: action.payload.SENTRY_DSN,
          tracesSampleRate: 0.6,
          beforeSend: event => {
            // skipping noisy errors from sentry
            if (event.exception?.values?.some(v => SKIPPED_ERRORS.some(err => v.value?.includes(err)))) {
              return null;
            }
            // we have to get this from electron store to get the most updated value
            // because the state object in this action is a snapshot of the state at the moment of executing the reducer
            const disableErrorReporting = electronStore.get('appConfig.disableErrorReporting');
            if (disableErrorReporting) {
              return null;
            }
            return event;
          },
        });
      } catch {
        log.warn("Couldn't initialize Sentry.");
      }
    },
    setUserApiKey: (state: Draft<AppConfig>, action: PayloadAction<{vendor: ApiKeyVendor; apiKey: string}>) => {
      state.userApiKeys[action.payload.vendor] = action.payload.apiKey;
      electronStore.set('appConfig.userApiKeys', state.userApiKeys);
    },
  },
  extraReducers: builder => {
    builder.addCase(setRootFolder.fulfilled, (state, action) => {
      state.isScanExcludesUpdated = action.payload.isScanIncludesUpdated;
      state.isScanIncludesUpdated = action.payload.isScanIncludesUpdated;
    });
  },
});

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

export const {
  changeCurrentProjectName,
  changeProjectsRootPath,
  createProject,
  deleteProject,
  handleFavoriteTemplate,
  initRendererSentry,
  openProject,
  setLoadingProject,
  setAccessLoading,
  setAutoZoom,
  setCurrentContext,
  setFilterObjects,
  setKubeConfig,
  setKubeConfigContextColor,
  setUserDirs,
  toggleEditorPlaceholderVisiblity,
  toggleErrorReporting,
  setEventTracking,
  setIsNewVersionAvailable,
  toggleProjectPin,
  updateApplicationSettings,
  updateFileExplorerSortOrder,
  updateFileIncludes,
  updateFolderReadsMaxDepth,
  updateLanguage,
  updateLoadLastProjectOnStartup,
  updateK8sVersion,
  updateNewVersion,
  updateProjectConfig,
  updateProjectK8sVersion,
  loadProjectKubeConfig,
  updateProjectsGitRepo,
  updateScanExcludes,
  updateTelemetry,
  updateTextSize,
  updateTheme,
  setUserApiKey,
} = configSlice.actions;
export default configSlice.reducer;
