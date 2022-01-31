import {readFileSync, writeFileSync} from 'fs';
import _ from 'lodash';
import log from 'loglevel';
import {sep} from 'path';
import {AnyAction} from 'redux';

import {AppConfig, ProjectConfig} from '@models/appconfig';

import {updateProjectConfig} from '@redux/reducers/appConfig';

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
        if (!_.isEqual(savedConfig, projectConfig)) {
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
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
};

// This function needs to be extended when new related value is added
// We need to think a better way
export const populateProjectConfigToWrite = (state: AppConfig | SerializableObject) => {
  const applicationConfig: ProjectConfig = {
    scanExcludes: state.projectConfig?.scanExcludes,
    fileIncludes: state.projectConfig?.fileIncludes,
    folderReadsMaxDepth: state.projectConfig?.folderReadsMaxDepth,
  };
  applicationConfig.settings = {
    helmPreviewMode: state.projectConfig?.settings?.helmPreviewMode,
    kustomizeCommand: state.projectConfig?.settings?.kustomizeCommand,
    hideExcludedFilesInFileExplorer: state.projectConfig?.settings?.hideExcludedFilesInFileExplorer,
    enableHelmWithKustomize: state.projectConfig?.settings?.enableHelmWithKustomize,
    createDefaultObjects: state.projectConfig?.settings?.createDefaultObjects,
    setDefaultPrimitiveValues: state.projectConfig?.settings?.setDefaultPrimitiveValues,
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
    enableHelmWithKustomize: state.settings.enableHelmWithKustomize,
    createDefaultObjects: state.settings.createDefaultObjects,
    setDefaultPrimitiveValues: state.settings.setDefaultPrimitiveValues,
  };
  applicationConfig.kubeConfig = {
    path: state.kubeConfig.path,
    isPathValid: state.kubeConfig.isPathValid,
    contexts: state.kubeConfig.contexts,
    currentContext: state.kubeConfig.currentContext,
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
          helmPreviewMode: _.includes(['template', 'install'], settings.helmPreviewMode)
            ? settings.helmPreviewMode
            : undefined,
          kustomizeCommand: _.includes(['kubectl', 'kustomize'], settings.kustomizeCommand)
            ? settings.kustomizeCommand
            : undefined,
          hideExcludedFilesInFileExplorer: _.isBoolean(settings.hideExcludedFilesInFileExplorer)
            ? settings.hideExcludedFilesInFileExplorer
            : undefined,
          enableHelmWithKustomize: _.isBoolean(settings.enableHelmWithKustomize)
            ? settings.enableHelmWithKustomize
            : undefined,
          createDefaultObjects: _.isBoolean(settings.createDefaultObjects) ? settings.createDefaultObjects : undefined,
          setDefaultPrimitiveValues: _.isBoolean(settings.setDefaultPrimitiveValues)
            ? settings.setDefaultPrimitiveValues
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
  if (!(baseConfig && baseConfig.settings && baseConfig.kubeConfig)) {
    throw Error('Base config must be set');
  }

  if (!config) {
    return baseConfig;
  }

  const serializedBaseConfig: SerializableObject = serializeObject(baseConfig);
  const serializedConfig: SerializableObject = serializeObject(config);

  Object.keys(serializedBaseConfig).forEach((key: string) => {
    if (!_.isUndefined(serializedConfig[key])) {
      serializedBaseConfig[key] = serializedConfig[key];
    }
  });

  return deserializeObject(serializedBaseConfig);
};

export const serializeObject = (objectToSerialize?: SerializableObject | null, prefix?: string): SerializableObject => {
  let serialized: any = {};

  if (!objectToSerialize) {
    return serialized;
  }
  Object.keys(objectToSerialize).forEach(key => {
    if (_.isObject(objectToSerialize[key]) && !_.isArray(objectToSerialize[key])) {
      const result: any = serializeObject(objectToSerialize[key], key);
      serialized = {
        ...serialized,
        ...result,
      };
    } else {
      const objectKey = prefix ? `${prefix}.${key}` : key;
      serialized[objectKey] = objectToSerialize[key];
    }
  });
  return serialized;
};

export const deserializeObject = (objectToDeserialize?: SerializableObject | null): SerializableObject => {
  const deserialized = {};

  if (!objectToDeserialize) {
    return deserialized;
  }

  Object.keys(objectToDeserialize).forEach(key => {
    _.set(deserialized, key, objectToDeserialize[key]);
  });
  return deserialized;
};

export const keysToUpdateStateBulk = (
  serializedState: SerializableObject,
  serializedIncomingConfig: SerializableObject
) => {
  const keys: string[] = [];

  Object.keys(serializedIncomingConfig).forEach((key: string) => {
    if (!_.isEqual(serializedState[key], serializedIncomingConfig[key])) {
      keys.push(key);
    }
  });

  return keys;
};
