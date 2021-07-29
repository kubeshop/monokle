import {createAsyncThunk} from '@reduxjs/toolkit';
import {AppDispatch, RootState} from '@redux/store';
import {PREVIEW_PREFIX, ROOT_FILE_ENTRY, YAML_DOCUMENT_DELIMITER} from '@src/constants';
import path from 'path';
import log from 'loglevel';
import {exec} from 'child_process';
import {createFileEntry, readFiles} from '@redux/utils/fileEntry';
import {AppState, FileMapType, HelmChartMapType, HelmValuesMapType, ResourceMapType} from '@models/appstate';
import {clearParsedDocs, extractK8sResources, processParsedResources} from '@redux/utils/resource';
import {stringify} from 'yaml';
import * as k8s from '@kubernetes/client-node';
import {FileEntry} from '@models/fileentry';
import {processKustomizations} from '@redux/utils/kustomize';
import {monitorRootFolder} from '@redux/utils/fileMonitor';
import {SetDiffDataPayload, SetPreviewDataPayload, SetRootFolderPayload} from '@redux/reducers/main';
import * as fs from 'fs';
import {AlertEnum} from '@models/alert';
import {getShellPath} from '@utils/shell';

export const previewKustomization = createAsyncThunk<
  SetPreviewDataPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/previewKustomization', async (resourceId, thunkAPI) => {
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
              PATH: getShellPath(),
            },
          },
          (error, stdout, stderr) => {
            log.info('got result');

            if (error) {
              reject(createPreviewRejection(thunkAPI, 'Kustomize Error', error.message));
              return;
            }
            if (stderr) {
              reject(createPreviewRejection(thunkAPI, 'Kustomize Error', `Failed to generate kustomization: ${stderr}`));
              return;
            }

            const resources = extractK8sResources(stdout, PREVIEW_PREFIX + resource.id);
            const resourceMap = resources.reduce((rm: ResourceMapType, r) => {
              rm[r.id] = r;
              return rm;
            }, {});

            processParsedResources(resourceMap);
            resolve({previewResourceId: resource.id, previewResources: clearParsedDocs(resourceMap)});
          }
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

export const previewCluster = createAsyncThunk<
  SetPreviewDataPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/previewCluster', async (configPath, thunkAPI) => {
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
        return {previewResourceId: configPath, previewResources: clearParsedDocs(resourceMap)};
      }

      return createPreviewRejection(thunkAPI, 'Cluster Resources Failed', 'Failed to get resources from cluster');
    }, (reason) => {
      return createPreviewRejection(thunkAPI, 'Cluster Resources Failed', reason.message);
    });
  }

  return {};
});

/**
 * Thunk to set the specified root folder
 */

export const setRootFolder = createAsyncThunk<
  SetRootFolderPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/setRootFolder', async (rootFolder, thunkAPI) => {
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
    resourceMap: clearParsedDocs(resourceMap),
    helmChartMap,
    helmValuesMap,
  };
});

/**
 * Thunk to diff a resource against the configured cluster
 */

export const diffResource = createAsyncThunk<
  SetDiffDataPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/setDiffContent', async (diffResourceId, thunkAPI) => {
  const resourceMap = thunkAPI.getState().main.resourceMap;
  const kubeconfig = thunkAPI.getState().config.kubeconfig;
  try {
    const resource = resourceMap[diffResourceId];
    if (resource && resource.text) {
      const kc = new k8s.KubeConfig();
      kc.loadFromFile(kubeconfig);

      const handleResource = (res: any) => {
        if (res.body) {
          delete res.body.metadata?.managedFields;
          return {diffContent: stringify(res.body, {sortMapEntries: true}), diffResourceId};
        }

        return createPreviewRejection(thunkAPI, 'Diff Resources', `Failed to get ${resource.content.kind} from cluster`);
      };

      const handleRejection = (rej: any) => {
        let message = `${resource.content.kind} ${resource.content.metadata.name} not found in cluster`;
        let title = 'Diff failed';

        return createPreviewRejection(thunkAPI, title, message);
      };

      if (resource.kind === 'ConfigMap') {
        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreV1Api
          .readNamespacedConfigMap(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true'
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'Service') {
        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreV1Api
          .readNamespacedService(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true'
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'Deployment') {
        const k8sAppV1Api = kc.makeApiClient(k8s.AppsV1Api);
        return k8sAppV1Api
          .readNamespacedDeployment(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true'
          )
          .then(handleResource, handleRejection);
      }
    }
  } catch (e) {
    createPreviewRejection(thunkAPI, 'Diff Resource', `Failed to diff resources; ${e.message}`);
    log.error(e);
  }

  return {};
});

export const previewHelmValuesFile = createAsyncThunk<
  SetPreviewDataPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/previewHelmValuesFile', async (valuesFileId, thunkAPI) => {
  const configState = thunkAPI.getState().config;
  const state = thunkAPI.getState().main;
  const kubeconfig = thunkAPI.getState().config.kubeconfig;
  if (state.previewValuesFile !== valuesFileId) {
    const valuesFile = state.helmValuesMap[valuesFileId];
    if (valuesFile && valuesFile.filePath) {
      const rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
      const folder = path.join(rootFolder, valuesFile.filePath.substr(0, valuesFile.filePath.lastIndexOf(path.sep)));
      const chart = state.helmChartMap[valuesFile.helmChart];

      // sanity check
      if (fs.existsSync(folder) && fs.existsSync(path.join(folder, valuesFile.name))) {
        log.info(`previewing ${valuesFile.name} in folder ${folder} using ${configState.settings.helmPreviewMode} mode`);

        // need to run kubectl for this since the kubernetes client doesn't support kustomization commands
        return new Promise((resolve, reject) => {
          const helmCommand =
            configState.settings.helmPreviewMode === 'template'
              ? `helm template -f ${valuesFile.name} ${chart.name} .`
              : `helm install -f ${valuesFile.name} ${chart.name} . --dry-run`;

          exec(
            helmCommand,
            {
              cwd: folder,
              env: {
                NODE_ENV: process.env.NODE_ENV,
                PUBLIC_URL: process.env.PUBLIC_URL,
                PATH: getShellPath(),
                KUBECONFIG: kubeconfig,
              },
            },
            (error, stdout, stderr) => {
              if (error) {
                reject(createPreviewRejection(thunkAPI, 'Helm Error', error.message));
                return;
              }
              if (stderr) {
                reject(createPreviewRejection(thunkAPI, 'Helm Error', `Failed to generate helm preview: ${stderr}`));
                return;
              }

              const resources = extractK8sResources(stdout, PREVIEW_PREFIX + valuesFile.id);
              const resourceMap = resources.reduce((rm: ResourceMapType, r) => {
                rm[r.id] = r;
                return rm;
              }, {});

              processParsedResources(resourceMap);
              resolve({previewResourceId: valuesFile.id, previewResources: clearParsedDocs(resourceMap)});
            }
          );
        });
      }
      log.error(`Can't run helm for ${valuesFile.name} in folder ${folder}`);
    }
  }

  return {};
});

function createPreviewRejection(thunkAPI: any, title: string, message: string) {
  return thunkAPI.rejectWithValue({
    alert: {
      title, message, type: AlertEnum.Error,
    },
  });
}
