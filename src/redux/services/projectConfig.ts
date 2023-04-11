import {readFileSync, statSync, writeFileSync} from 'fs';
import _, {isArray, mergeWith} from 'lodash';
import log from 'loglevel';
import {sep} from 'path';
import {AnyAction} from 'redux';
import invariant from 'tiny-invariant';

import {updateProjectConfig} from '@redux/appConfig';

import {K8S_VERSIONS, PREDEFINED_K8S_VERSION} from '@shared/constants/k8s';
import {AppConfig, ProjectConfig} from '@shared/models/config';
import {isEqual} from '@shared/utils/isEqual';
import {updateProjectConfigTimestamp} from '@shared/utils/projectConfig';

export interface SerializableObject {
  [name: string]: any;
}

export const CONFIG_PATH = (projectRootPath?: string | null) =>
  projectRootPath ? `${projectRootPath}${sep}.monokle` : '';

export const writeProjectConfigFile = (state: AppConfig | SerializableObject) => {
  try {
    const absolutePath = CONFIG_PATH(state.selectedProjectRootFolder);

    const projectConfig = populateProjectConfigToWrite(state);
    if (projectConfig && !_.isEmpty(projectConfig)) {
      try {
        const savedConfig: ProjectConfig = JSON.parse(readFileSync(absolutePath, 'utf8'));
        if (!isEqual(savedConfig, projectConfig)) {
          writeFileSync(absolutePath, JSON.stringify(projectConfig, null, 4), 'utf-8');
        }
      } catch (error: any) {
        if (error instanceof Error) {
          log.warn(`[writeProjectConfigFile]: ${error.message}`);
        }
        writeFileSync(absolutePath, JSON.stringify(projectConfig, null, 4), 'utf-8');
      }
    } else {
      writeFileSync(absolutePath, ``, 'utf-8');
    }

    updateProjectConfigTimestamp(statSync(absolutePath).mtimeMs);
  } catch (error) {
    log.error(error);
  }
};

// This function needs to be extended when new related value is added
// We need to think a better way
export const populateProjectConfigToWrite = (state: AppConfig | SerializableObject) => {
  const applicationConfig: ProjectConfig = {
    scanExcludes: state.projectConfig?.scanExcludes,
    fileIncludes: state.projectConfig?.fileIncludes,
    folderReadsMaxDepth: state.projectConfig?.folderReadsMaxDepth,
    k8sVersion: state.projectConfig?.k8sVersion,
    helm: state.projectConfig?.helm,
    savedCommandMap: state.projectConfig?.savedCommandMap,
  };
  applicationConfig.settings = {
    helmPreviewMode: state.projectConfig?.settings?.helmPreviewMode,
    kustomizeCommand: state.projectConfig?.settings?.kustomizeCommand,
    hideExcludedFilesInFileExplorer: state.projectConfig?.settings?.hideExcludedFilesInFileExplorer,
    hideUnsupportedFilesInFileExplorer: state.projectConfig?.settings?.hideUnsupportedFilesInFileExplorer,
    enableHelmWithKustomize: state.projectConfig?.settings?.enableHelmWithKustomize,
    createDefaultObjects: state.projectConfig?.settings?.createDefaultObjects,
    setDefaultPrimitiveValues: state.projectConfig?.settings?.setDefaultPrimitiveValues,
    allowEditInClusterMode: state.projectConfig?.settings?.allowEditInClusterMode,
  };
  applicationConfig.kubeConfig = {
    path: state.projectConfig?.kubeConfig?.path,
    currentContext: state.projectConfig?.kubeConfig?.currentContext,
  };

  return applicationConfig;
};

// This function needs to be extended when new related value is added
// We need to think a better way
export const populateProjectConfig = (state: AppConfig | SerializableObject) => {
  const applicationConfig: ProjectConfig = {
    scanExcludes: state.scanExcludes,
    fileIncludes: state.fileIncludes,
    folderReadsMaxDepth: state.folderReadsMaxDepth,
  };
  applicationConfig.settings = {
    helmPreviewMode: state.settings.helmPreviewMode,
    kustomizeCommand: state.settings.kustomizeCommand,
    hideExcludedFilesInFileExplorer: state.settings.hideExcludedFilesInFileExplorer,
    hideUnsupportedFilesInFileExplorer: state.settings.hideUnsupportedFilesInFileExplorer,
    enableHelmWithKustomize: state.settings.enableHelmWithKustomize,
    createDefaultObjects: state.settings.createDefaultObjects,
    setDefaultPrimitiveValues: state.settings.setDefaultPrimitiveValues,
    allowEditInClusterMode: state.settings.allowEditInClusterMode,
  };
  applicationConfig.kubeConfig = {
    path: state.kubeConfig.path,
    isPathValid: state.kubeConfig.isPathValid,
    contexts: state.kubeConfig.contexts,
    currentContext: state.kubeConfig.currentContext,
  };
  applicationConfig.k8sVersion = state.k8sVersion;
  applicationConfig.helm = state.projectConfig?.helm;
  applicationConfig.savedCommandMap = state.projectConfig?.savedCommandMap;
  return applicationConfig;
};

export const readProjectConfig = (projectRootPath?: string | null): ProjectConfig | null => {
  if (!projectRootPath) {
    return null;
  }

  try {
    const {
      settings,
      kubeConfig,
      scanExcludes,
      fileIncludes,
      folderReadsMaxDepth,
      k8sVersion,
      helm,
      savedCommandMap,
    }: ProjectConfig = JSON.parse(readFileSync(CONFIG_PATH(projectRootPath), 'utf8'));
    const projectConfig: ProjectConfig = {};

    projectConfig.settings = settings
      ? {
          helmPreviewMode: _.includes(['template', 'install'], settings.helmPreviewMode)
            ? settings.helmPreviewMode
            : undefined,
          kustomizeCommand: _.includes(['kubectl', 'kustomize'], settings.kustomizeCommand)
            ? settings.kustomizeCommand
            : undefined,
          hideExcludedFilesInFileExplorer: _.isBoolean(settings.hideExcludedFilesInFileExplorer)
            ? settings.hideExcludedFilesInFileExplorer
            : undefined,
          hideUnsupportedFilesInFileExplorer: _.isBoolean(settings.hideUnsupportedFilesInFileExplorer)
            ? settings.hideUnsupportedFilesInFileExplorer
            : undefined,
          enableHelmWithKustomize: _.isBoolean(settings.enableHelmWithKustomize)
            ? settings.enableHelmWithKustomize
            : undefined,
          createDefaultObjects: _.isBoolean(settings.createDefaultObjects) ? settings.createDefaultObjects : undefined,
          setDefaultPrimitiveValues: _.isBoolean(settings.setDefaultPrimitiveValues)
            ? settings.setDefaultPrimitiveValues
            : undefined,
          allowEditInClusterMode: _.isBoolean(settings.allowEditInClusterMode)
            ? settings.allowEditInClusterMode
            : undefined,
        }
      : undefined;
    projectConfig.kubeConfig = kubeConfig
      ? {
          path: _.isString(kubeConfig.path) ? kubeConfig.path : undefined,
          currentContext: _.isString(kubeConfig.currentContext) ? kubeConfig.currentContext : undefined,
        }
      : undefined;

    projectConfig.scanExcludes = _.isArray(scanExcludes) ? scanExcludes : undefined;
    projectConfig.fileIncludes = _.isArray(fileIncludes) ? fileIncludes : undefined;
    projectConfig.folderReadsMaxDepth = _.isNumber(folderReadsMaxDepth) ? folderReadsMaxDepth : undefined;
    projectConfig.k8sVersion = _.includes(K8S_VERSIONS, k8sVersion) ? k8sVersion : PREDEFINED_K8S_VERSION;
    projectConfig.helm = helm;
    projectConfig.savedCommandMap = savedCommandMap;

    return projectConfig;
  } catch (error) {
    if (error instanceof Error) {
      log.warn(`[readProjectConfig]: ${error.message}`);
    }
    return null;
  }
};

export const updateProjectSettings = (dispatch: (action: AnyAction) => void, projectRootPath?: string | null) => {
  const projectConfig: ProjectConfig | null = readProjectConfig(projectRootPath);
  if (projectConfig) {
    dispatch(updateProjectConfig({config: projectConfig, fromConfigFile: true}));
    return;
  }

  dispatch(updateProjectConfig({config: null, fromConfigFile: true}));
};

export const mergeConfigs = (baseConfig: ProjectConfig, config?: ProjectConfig | null): ProjectConfig => {
  invariant(baseConfig && baseConfig.settings && baseConfig.kubeConfig, 'base config expected');
  return mergeWith(baseConfig, config, (_a, b) => (isArray(b) ? b : undefined));
};

export const keysToUpdateStateBulk = (
  serializedState: SerializableObject,
  serializedIncomingConfig: SerializableObject
) => {
  const keys: string[] = [];

  Object.keys(serializedIncomingConfig).forEach((key: string) => {
    if (
      _.isArray(serializedState[key]) &&
      _.isArray(serializedIncomingConfig[key]) &&
      !isEqual(_.sortBy(serializedState[key]), _.sortBy(serializedIncomingConfig[key]))
    ) {
      keys.push(key);
    } else if (!isEqual(serializedState[key], serializedIncomingConfig[key])) {
      keys.push(key);
    }
  });

  return keys;
};

export const keysToDelete = (
  serializedState: SerializableObject,
  serializedIncomingConfig: SerializableObject,
  incomingConfigKeys: string[]
) => {
  const keys: string[] = [];

  Object.keys(serializedState)
    .filter(key => incomingConfigKeys.includes(key.split('.')[0]))
    .forEach((key: string) => {
      if (!_.has(serializedIncomingConfig, key)) {
        keys.push(key);
      }
    });

  return keys;
};

export function getK8sVersion(projectConfig: ProjectConfig) {
  return projectConfig.k8sVersion || PREDEFINED_K8S_VERSION;
}
