import {readFileSync, writeFileSync} from 'fs';
import _ from 'lodash';
import {sep} from 'path';
import {AnyAction} from 'redux';

import {AppConfig, ProjectConfig} from '@models/appconfig';

import {updateProjectConfig} from '@redux/reducers/appConfig';

export const CONFIG_PATH = (projectRootPath?: string | null) =>
  projectRootPath ? `${projectRootPath}${sep}.monokle` : '';

export const writeProjectConfigFile = (state: AppConfig, projectConfig: ProjectConfig | null) => {
  const absolutePath = CONFIG_PATH(state.selectedProjectRootFolder);

  const applicationConfig: ProjectConfig = populateProjectConfig(state);
  const mergedConfigs = mergeConfigs(applicationConfig, projectConfig);
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
};

export const populateProjectConfig = (state: AppConfig) => {
  const applicationConfig: ProjectConfig = {
    scanExcludes: state.scanExcludes,
    fileIncludes: state.fileIncludes,
    folderReadsMaxDepth: state.folderReadsMaxDepth,
  };
  applicationConfig.settings = {
    helmPreviewMode: state.settings.helmPreviewMode,
    kustomizeCommand: state.settings.kustomizeCommand,
    hideExcludedFilesInFileExplorer: state.settings.hideExcludedFilesInFileExplorer,
    isClusterSelectorVisible: state.settings.isClusterSelectorVisible,
    loadLastProjectOnStartup: state.settings.loadLastProjectOnStartup,
    enableHelmWithKustomize: state.settings.enableHelmWithKustomize,
  };
  applicationConfig.kubeConfig = {
    path: state.kubeConfig.path,
    isPathValid: state.kubeConfig.isPathValid,
    contexts: state.kubeConfig.contexts,
  };
  return applicationConfig;
};

export const readProjectConfig = (projectRootPath?: string | null): ProjectConfig | null => {
  if (!projectRootPath) {
    return null;
  }

  try {
    const {settings, kubeConfig, scanExcludes, fileIncludes, folderReadsMaxDepth}: ProjectConfig = JSON.parse(
      readFileSync(CONFIG_PATH(projectRootPath), 'utf8')
    );
    const projectConfig: ProjectConfig = {};
    projectConfig.settings = settings
      ? {
          helmPreviewMode: settings.helmPreviewMode,
          kustomizeCommand: settings.kustomizeCommand,
          hideExcludedFilesInFileExplorer: settings.hideExcludedFilesInFileExplorer,
          isClusterSelectorVisible: settings.isClusterSelectorVisible,
        }
      : undefined;
    projectConfig.kubeConfig = kubeConfig
      ? {
          path: kubeConfig.path,
          currentContext: kubeConfig.currentContext,
          isPathValid: kubeConfig.isPathValid,
        }
      : undefined;

    projectConfig.scanExcludes = scanExcludes;
    projectConfig.fileIncludes = fileIncludes;
    projectConfig.folderReadsMaxDepth = folderReadsMaxDepth;

    return projectConfig;
  } catch (error) {
    return null;
  }
};

export const updateProjectSettings = (dispatch: (action: AnyAction) => void, projectRootPath?: string | null) => {
  const projectConfig: ProjectConfig | null = readProjectConfig(projectRootPath);
  if (projectConfig) {
    dispatch(updateProjectConfig(projectConfig));
    return;
  }
  dispatch(updateProjectConfig(null));
};

// I am not proud of this code. It can be surely do it better.
// After 1.5.0 I will refactor this one
export const mergeConfigs = (baseConfig: ProjectConfig, config?: ProjectConfig | null) => {
  if (!(baseConfig && baseConfig.settings && baseConfig.kubeConfig)) {
    throw Error('Base config must be set');
  }

  if (!config) {
    return baseConfig;
  }

  if (
    _.isString(config.settings?.helmPreviewMode) &&
    !_.isEqual(config.settings?.helmPreviewMode, baseConfig.settings?.helmPreviewMode)
  ) {
    baseConfig.settings.helmPreviewMode = config.settings?.helmPreviewMode;
  }

  if (
    _.isString(config.settings?.kustomizeCommand) &&
    !_.isEqual(config.settings?.kustomizeCommand, baseConfig.settings?.kustomizeCommand)
  ) {
    baseConfig.settings.kustomizeCommand = config.settings?.kustomizeCommand;
  }
  if (
    _.isBoolean(config.settings?.loadLastProjectOnStartup) &&
    !_.isEqual(config.settings?.loadLastProjectOnStartup, baseConfig.settings?.loadLastProjectOnStartup)
  ) {
    baseConfig.settings.loadLastProjectOnStartup = config.settings?.loadLastProjectOnStartup;
  }
  if (
    _.isBoolean(config.settings?.enableHelmWithKustomize) &&
    !_.isEqual(config.settings?.enableHelmWithKustomize, baseConfig.settings?.enableHelmWithKustomize)
  ) {
    baseConfig.settings.enableHelmWithKustomize = config.settings?.enableHelmWithKustomize;
  }
  if (
    _.isBoolean(config.settings?.hideExcludedFilesInFileExplorer) &&
    !_.isEqual(config.settings?.hideExcludedFilesInFileExplorer, baseConfig.settings?.hideExcludedFilesInFileExplorer)
  ) {
    baseConfig.settings.hideExcludedFilesInFileExplorer = config.settings?.hideExcludedFilesInFileExplorer;
  }
  if (
    _.isBoolean(config.settings?.isClusterSelectorVisible) &&
    !_.isEqual(config.settings?.isClusterSelectorVisible, baseConfig.settings?.isClusterSelectorVisible)
  ) {
    baseConfig.settings.isClusterSelectorVisible = config.settings?.isClusterSelectorVisible;
  }
  if (_.isEmpty(baseConfig.settings)) {
    baseConfig.settings = undefined;
  }
  if (_.isString(config.kubeConfig?.path) && !_.isEqual(config.kubeConfig?.path, baseConfig.kubeConfig?.path)) {
    baseConfig.kubeConfig.path = config.kubeConfig?.path;
  }
  if (
    _.isBoolean(config.kubeConfig?.isPathValid) &&
    !_.isEqual(config.kubeConfig?.isPathValid, baseConfig.kubeConfig?.isPathValid)
  ) {
    baseConfig.kubeConfig.isPathValid = config.kubeConfig?.isPathValid;
  }
  if (
    _.isString(config.kubeConfig?.currentContext) &&
    !_.isEqual(config.kubeConfig?.currentContext, baseConfig.kubeConfig?.currentContext)
  ) {
    baseConfig.kubeConfig.currentContext = config.kubeConfig?.currentContext;
  }
  if (
    _.isArray(config.kubeConfig?.contexts) &&
    !_.isEqual(_.sortBy(config.kubeConfig?.contexts), _.sortBy(baseConfig.kubeConfig?.contexts))
  ) {
    baseConfig.kubeConfig.contexts = config.kubeConfig?.contexts;
  }
  if (_.isEmpty(baseConfig.kubeConfig)) {
    baseConfig.kubeConfig = undefined;
  }

  if (_.isArray(config.scanExcludes) && !_.isEqual(_.sortBy(config.scanExcludes), _.sortBy(baseConfig.scanExcludes))) {
    baseConfig.scanExcludes = config.scanExcludes;
  }

  if (_.isArray(config.fileIncludes) && !_.isEqual(_.sortBy(config.fileIncludes), _.sortBy(baseConfig.fileIncludes))) {
    baseConfig.fileIncludes = config.fileIncludes;
  }

  if (
    _.isNumber(config.folderReadsMaxDepth) &&
    !_.isEqual(config.folderReadsMaxDepth, baseConfig.folderReadsMaxDepth)
  ) {
    baseConfig.folderReadsMaxDepth = config.folderReadsMaxDepth;
  }

  return baseConfig;
};
