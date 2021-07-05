import {createAsyncThunk} from '@reduxjs/toolkit';
import {AppDispatch, RootState} from '@redux/store';
import {PREVIEW_PREFIX, ROOT_FILE_ENTRY, YAML_DOCUMENT_DELIMITER} from '@src/constants';
import path from 'path';
import log from 'loglevel';
import {exec} from 'child_process';
import {createFileEntry, readFiles} from '@redux/utils/fileEntry';
import {AppState, FileMapType, ResourceMapType} from '@models/appstate';
import {extractK8sResources, processParsedResources} from '@redux/utils/resource';
import {stringify} from 'yaml';
import * as k8s from '@kubernetes/client-node';
// @ts-ignore
import shellPath from 'shell-path';
import {FileEntry} from '@models/fileentry';
import {processKustomizations} from '@redux/utils/kustomize';
import {monitorRootFolder} from '@redux/utils/fileMonitor';
import {SetPreviewDataPayload, SetRootFolderPayload} from '@redux/reducers/main';

/**
 * Thunk to preview a kustomization
 */

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

  fileMap[ROOT_FILE_ENTRY] = rootEntry;
  rootEntry.children = readFiles(rootFolder, appConfig, resourceMap, fileMap);

  processKustomizations(resourceMap, fileMap);
  processParsedResources(resourceMap);

  monitorRootFolder(rootFolder, appConfig, thunkAPI.dispatch);

  return {
    appConfig,
    fileMap,
    resourceMap,
  };
});
