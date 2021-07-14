import {createAsyncThunk} from '@reduxjs/toolkit';
import {AppDispatch, RootState} from '@redux/store';
import {PREVIEW_PREFIX, ROOT_FILE_ENTRY, YAML_DOCUMENT_DELIMITER} from '@src/constants';
import path from 'path';
import log from 'loglevel';
import {exec} from 'child_process';
import {createFileEntry, readFiles} from '@redux/utils/fileEntry';
import {AppState, FileMapType, HelmChartMapType, HelmValuesMapType, ResourceMapType} from '@models/appstate';
import {extractK8sResources, processParsedResources} from '@redux/utils/resource';
import {stringify} from 'yaml';
import * as k8s from '@kubernetes/client-node';
// @ts-ignore
import shellPath from 'shell-path';
import {FileEntry} from '@models/fileentry';
import {processKustomizations} from '@redux/utils/kustomize';
import {monitorRootFolder} from '@redux/utils/fileMonitor';
import {SetDiffDataPayload, SetPreviewDataPayload, SetRootFolderPayload} from '@redux/reducers/main';
import {PROCESS_ENV} from '@actions/common/apply';
import {AlertEnum, AlertType} from '@models/alert';
import {setAlert} from '@redux/reducers/alert';
import * as fs from 'fs';

export const previewKustomization = createAsyncThunk<SetPreviewDataPayload,
  string,
  {
    dispatch: AppDispatch,
    state: RootState,
  }>
('main/previewKustomization', async (resourceId, thunkAPI) => {
  const state = thunkAPI.getState().main;
  if (state.previewResource !== resourceId) {
    const resource = state.resourceMap[resourceId];
    if (resource && resource.filePath) {
      const rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
      const folder = path.join(rootFolder, resource.filePath.substr(0, resource.filePath.lastIndexOf(path.sep)));
      log.info(`previewing ${resource.id} in folder ${folder}`);

      // need to run kubectl for this since the kubernetes client doesn't support kustomization commands
      return new Promise((resolve, reject) => {
        exec(
          'kubectl kustomize ./',
          {
            cwd: folder,
            env: {
              NODE_ENV: process.env.NODE_ENV,
              PUBLIC_URL: process.env.PUBLIC_URL,
              PATH: shellPath.sync(),
            },
          },
          (error, stdout, stderr) => {
            if (error) {
              reject(error);
              return;
            }
            if (stderr) {
              dispatchError('Kustomize preview failed', stderr, thunkAPI);
              reject(new Error(`Failed to generate kustomization: ${stderr}`));
              return;
            }

            const resources = extractK8sResources(stdout, PREVIEW_PREFIX + resource.id);
            const resourceMap = resources.reduce((rm: ResourceMapType, r) => {
              rm[r.id] = r;
              return rm;
            }, {});

            processParsedResources(resourceMap);

            resolve({previewResourceId: resource.id, previewResources: resourceMap});
          },
        );
      });
    }
  }

  return {};
});

/**
 * Utility to convert list of objects returned by k8s api to a single YAML document
 */

function getK8sObjectsAsYaml(items: any[], kind: string, apiVersion: string) {
  return items
    .map(item => {
      delete item.metadata?.managedFields;
      return `apiVersion: ${apiVersion}\nkind: ${kind}\n${stringify(item)}`;
    })
    .join(YAML_DOCUMENT_DELIMITER);
}

/**
 * Thunk to preview cluster objects
 */

export const previewCluster = createAsyncThunk<SetPreviewDataPayload,
  string,
  {
    dispatch: AppDispatch,
    state: RootState,
  }>
('main/previewCluster', async (configPath, thunkAPI) => {
  const state: AppState = thunkAPI.getState().main;
  if (state.previewResource !== configPath) {
    const kc = new k8s.KubeConfig();
    kc.loadFromFile(configPath);
    const k8sAppV1Api = kc.makeApiClient(k8s.AppsV1Api);
    const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);

    return Promise.all([
      k8sAppV1Api.listDeploymentForAllNamespaces().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'Deployment', 'apps/v1');
      }),
      k8sCoreV1Api.listConfigMapForAllNamespaces().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'ConfigMap', 'v1');
      }),
      k8sCoreV1Api.listServiceForAllNamespaces().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'Service', 'v1');
      }),
    ]).then(yamls => {
      const allYaml = yamls.join(YAML_DOCUMENT_DELIMITER);
      const resources = extractK8sResources(allYaml, PREVIEW_PREFIX + configPath);

      if (resources && resources.length > 0) {
        const resourceMap = resources.reduce((acc: ResourceMapType, item) => {
          acc[item.id] = item;
          return acc;
        }, {});

        processParsedResources(resourceMap);
        return {previewResourceId: configPath, previewResources: resourceMap};
      }

      return {};
    });
  }

  return {};
});

/**
 * Thunk to set the specified root folder
 */

export const setRootFolder = createAsyncThunk<SetRootFolderPayload,
  string,
  {
    dispatch: AppDispatch,
    state: RootState,
  }>
('main/setRootFolder', async (rootFolder, thunkAPI) => {
  const appConfig = thunkAPI.getState().config;
  const resourceMap: ResourceMapType = {};
  const fileMap: FileMapType = {};
  const rootEntry: FileEntry = createFileEntry(rootFolder);
  const helmChartMap: HelmChartMapType = {};
  const helmValuesMap: HelmValuesMapType = {};

  fileMap[ROOT_FILE_ENTRY] = rootEntry;
  rootEntry.children = readFiles(rootFolder, appConfig, resourceMap, fileMap, helmChartMap, helmValuesMap);

  processKustomizations(resourceMap, fileMap);
  processParsedResources(resourceMap);

  monitorRootFolder(rootFolder, appConfig, thunkAPI.dispatch);

  return {
    appConfig,
    fileMap,
    resourceMap,
    helmChartMap,
    helmValuesMap,
  };
});

function dispatchError(title: string, message: string, thunkAPI: any) {
  const alert: AlertType = {
    type: AlertEnum.Error,
    title,
    message,
  };
  thunkAPI.dispatch(setAlert(alert));
}

/**
 * Thunk to diff a resource against the configured cluster
 */

export const diffResource = createAsyncThunk<SetDiffDataPayload,
  string,
  {
    dispatch: AppDispatch,
    state: RootState,
  }>
('main/setDiffContent', async (diffResourceId, thunkAPI) => {
  const resourceMap = thunkAPI.getState().main.resourceMap;
  try {
    const resource = resourceMap[diffResourceId];
    if (resource && resource.text) {
      const kc = new k8s.KubeConfig();
      kc.loadFromFile(PROCESS_ENV.KUBECONFIG);

      const handleResource = (res: any) => {
        if (res.body) {
          delete res.body.metadata?.managedFields;
          return {diffContent: stringify(res.body, {sortMapEntries: true}), diffResourceId};
        }

        log.error(`Failed to get ${resource.content.kind} from cluster`);
        return {};
      };

      const handleRejection = (rej: any) => {
        let message = `${resource.content.kind} ${resource.content.metadata.name} not found in cluster`;
        let title = 'Diff failed';
        dispatchError(title, message, thunkAPI);
        return {};
      };

      if (resource.kind === 'ConfigMap') {
        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreV1Api.readNamespacedConfigMap(resource.content.metadata.name,
          resource.namespace ? resource.namespace : 'default', 'true').then(handleResource, handleRejection);
      }
      if (resource.kind === 'Service') {
        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreV1Api.readNamespacedService(resource.content.metadata.name,
          resource.namespace ? resource.namespace : 'default', 'true').then(handleResource, handleRejection);
      }
      if (resource.kind === 'Deployment') {
        const k8sAppV1Api = kc.makeApiClient(k8s.AppsV1Api);
        return k8sAppV1Api.readNamespacedDeployment(resource.content.metadata.name,
          resource.namespace ? resource.namespace : 'default', 'true').then(handleResource, handleRejection);
      }
    }
  } catch (e) {
    log.error('Failed to diff resource');
    log.error(e);
  }

  return {};
});

export const previewHelmValuesFile = createAsyncThunk<SetPreviewDataPayload,
  string,
  {
    dispatch: AppDispatch,
    state: RootState,
  }>
('main/previewHelmValuesFile', async (valuesFileId, thunkAPI) => {
  const state = thunkAPI.getState().main;
  if (state.previewValuesFile !== valuesFileId) {
    const valuesFile = state.helmValuesMap[valuesFileId];
    if (valuesFile && valuesFile.filePath) {
      const rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
      const folder = path.join(rootFolder, valuesFile.filePath.substr(0, valuesFile.filePath.lastIndexOf(path.sep)));
      const chart = state.helmChartMap[valuesFile.helmChart];

      // sanity check
      if (fs.existsSync(folder) && fs.existsSync(path.join(folder, valuesFile.name))) {
        log.info(`previewing ${valuesFile.name} in folder ${folder}`);

        // need to run kubectl for this since the kubernetes client doesn't support kustomization commands
        return new Promise((resolve, reject) => {
          const helmCommand = state.appConfig.settings.helmPreviewMode === 'template' ?
            `helm template -f ${valuesFile.name} ${chart.name} .` :
            `helm install -f ${valuesFile.name} ${chart.name} . --dry-run`;

          exec(
            helmCommand,
            {
              cwd: folder,
              env: {
                NODE_ENV: process.env.NODE_ENV,
                PUBLIC_URL: process.env.PUBLIC_URL,
                PATH: shellPath.sync(),
                KUBECONFIG: PROCESS_ENV.KUBECONFIG,
              },
            },
            (error, stdout, stderr) => {
              if (error) {
                dispatchError('Helm preview failed', error.message, thunkAPI);
                reject(error);
                return;
              }
              if (stderr) {
                dispatchError('Helm preview failed', stderr, thunkAPI);
                reject(new Error(`Failed to generate helm preview: ${stderr}`));
                return;
              }

              const resources = extractK8sResources(stdout, PREVIEW_PREFIX + valuesFile.id);
              const resourceMap = resources.reduce((rm: ResourceMapType, r) => {
                rm[r.id] = r;
                return rm;
              }, {});

              processParsedResources(resourceMap);

              resolve({previewResourceId: valuesFile.id, previewResources: resourceMap});
            },
          );
        });
      }
      log.error(`Can't run helm for ${valuesFile.name} in folder ${folder}`);
    }
  }

  return {};
});
