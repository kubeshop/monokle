import {createAsyncThunk} from '@reduxjs/toolkit';
import {AppDispatch, RootState} from '@redux/store';
import {PREVIEW_PREFIX, ROOT_FILE_ENTRY, YAML_DOCUMENT_DELIMITER} from '@src/constants';
import path from 'path';
import log from 'loglevel';
import {createFileEntry, readFiles} from '@redux/utils/fileEntry';
import {AppState, FileMapType, HelmChartMapType, HelmValuesMapType, ResourceMapType} from '@models/appstate';
import {clearParsedDocs, extractK8sResources, processParsedResources} from '@redux/utils/resource';
import {stringify} from 'yaml';
import * as k8s from '@kubernetes/client-node';
// @ts-ignore
import {FileEntry} from '@models/fileentry';
import {processKustomizations} from '@redux/utils/kustomize';
import {monitorRootFolder} from '@redux/utils/fileMonitor';
import {SetDiffDataPayload, SetPreviewDataPayload, SetRootFolderPayload} from '@redux/reducers/main';
import * as fs from 'fs';
import {AlertEnum} from '@models/alert';
import {ipcRenderer} from 'electron';

/**
 * Thunk to preview kustomizations
 */

export const previewKustomization = createAsyncThunk<SetPreviewDataPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }>('main/previewKustomization', async (resourceId, thunkAPI) => {
  const state = thunkAPI.getState().main;
  if (state.previewResource !== resourceId) {
    const resource = state.resourceMap[resourceId];
    if (resource && resource.filePath) {
      const rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
      const folder = path.join(rootFolder, resource.filePath.substr(0, resource.filePath.lastIndexOf(path.sep)));

      log.info(`previewing ${resource.id} in folder ${folder}`);
      const result = await runKustomize(folder);

      if (result.error) {
        return createPreviewRejection(thunkAPI, 'Kustomize Error', result.error);
      }

      if (result.stdout) {
        return createPreviewResult(result.stdout, resource.id);
      }
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
    dispatch: AppDispatch;
    state: RootState;
  }>('main/previewCluster', async (configPath, thunkAPI) => {
  const state: AppState = thunkAPI.getState().main;
  if (state.previewResource !== configPath) {
    const kc = new k8s.KubeConfig();
    kc.loadFromFile(configPath);
    const k8sAppV1Api = kc.makeApiClient(k8s.AppsV1Api);
    const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
    const k8sBatchV1Api = kc.makeApiClient(k8s.BatchV1Api);
    const k8sRbacV1Api = kc.makeApiClient(k8s.RbacAuthorizationV1Api);

    return Promise.allSettled([
      k8sAppV1Api.listDaemonSetForAllNamespaces().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'DaemonSet', 'apps/v1');
      }),
      k8sAppV1Api.listDeploymentForAllNamespaces().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'Deployment', 'apps/v1');
      }),
      k8sAppV1Api.listStatefulSetForAllNamespaces().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'StatefuleSet', 'apps/v1');
      }),
      k8sAppV1Api.listReplicaSetForAllNamespaces().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'ReplicaSet', 'apps/v1');
      }),
      k8sCoreV1Api.listConfigMapForAllNamespaces().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'ConfigMap', 'v1');
      }),
      k8sCoreV1Api.listServiceForAllNamespaces().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'Service', 'v1');
      }),
      k8sCoreV1Api.listServiceAccountForAllNamespaces().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'ServiceAccount', 'v1');
      }),
      k8sCoreV1Api.listPersistentVolume().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'PersistentVolume', 'v1');
      }),
      k8sCoreV1Api.listPersistentVolumeClaimForAllNamespaces().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'PersistentVolumeClaim', 'v1');
      }),
      k8sCoreV1Api.listPodForAllNamespaces().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'Pod', 'v1');
      }),
      k8sCoreV1Api.listEndpointsForAllNamespaces().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'Endpoints', 'v1');
      }),
      k8sCoreV1Api.listSecretForAllNamespaces().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'Secret', 'v1');
      }),
      k8sCoreV1Api.listReplicationControllerForAllNamespaces().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'ReplicationController', 'v1');
      }),
      k8sBatchV1Api.listJobForAllNamespaces().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'Job', 'batch/v1');
      }),
      k8sBatchV1Api.listCronJobForAllNamespaces().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'CronJob', 'batch/v1');
      }),
      k8sRbacV1Api.listClusterRole().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'ClusterRole', 'rbac.authorization.k8s.io/v1');
      }),
      k8sRbacV1Api.listClusterRoleBinding().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'ClusterRoleBinding', 'rbac.authorization.k8s.io/v1');
      }),
      k8sRbacV1Api.listRoleForAllNamespaces().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'Role', 'rbac.authorization.k8s.io/v1');
      }),
      k8sRbacV1Api.listRoleBindingForAllNamespaces().then(res => {
        return getK8sObjectsAsYaml(res.body.items, 'RoleBinding', 'rbac.authorization.k8s.io/v1');
      }),
    ]).then(results => {
      // @ts-ignore
      const allYaml = results.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value).join(YAML_DOCUMENT_DELIMITER);
      return createPreviewResult(allYaml, configPath);
    }, (reason) => {
      return createPreviewRejection(thunkAPI, 'Cluster Resources Failed', reason.message);
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
    dispatch: AppDispatch;
    state: RootState;
  }>('main/setRootFolder', async (rootFolder, thunkAPI) => {
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

export const diffResource = createAsyncThunk<SetDiffDataPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }>('main/setDiffContent', async (diffResourceId, thunkAPI) => {
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
            'true',
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'Service') {
        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreV1Api
          .readNamespacedService(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true',
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'ServiceAccount') {
        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreV1Api
          .readNamespacedServiceAccount(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true',
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'PersistentVolume') {
        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreV1Api
          .readPersistentVolume(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'PersistentVolumeClaim') {
        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreV1Api
          .readNamespacedPersistentVolumeClaim(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true',
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'Pod') {
        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreV1Api
          .readNamespacedPod(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true',
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'Endpoints') {
        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreV1Api
          .readNamespacedEndpoints(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true',
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'Secret') {
        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreV1Api
          .readNamespacedSecret(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true',
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'ReplicationController') {
        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreV1Api
          .readNamespacedReplicationController(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true',
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'DaemonSet') {
        const k8sAppV1Api = kc.makeApiClient(k8s.AppsV1Api);
        return k8sAppV1Api
          .readNamespacedDaemonSet(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true',
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'Deployment') {
        const k8sAppV1Api = kc.makeApiClient(k8s.AppsV1Api);
        return k8sAppV1Api
          .readNamespacedDeployment(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true',
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'StatefuleSet') {
        const k8sAppV1Api = kc.makeApiClient(k8s.AppsV1Api);
        return k8sAppV1Api
          .readNamespacedStatefulSet(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true',
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'ReplicaSet') {
        const k8sAppV1Api = kc.makeApiClient(k8s.AppsV1Api);
        return k8sAppV1Api
          .readNamespacedReplicaSet(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true',
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'Job') {
        const k8sBatchV1Api = kc.makeApiClient(k8s.BatchV1Api);
        return k8sBatchV1Api
          .readNamespacedJob(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true',
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'CronJob') {
        const k8sBatchV1Api = kc.makeApiClient(k8s.BatchV1Api);
        return k8sBatchV1Api
          .readNamespacedCronJob(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true',
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'ClusterRole') {
        const k8sRbacV1Api = kc.makeApiClient(k8s.RbacAuthorizationV1Api);
        return k8sRbacV1Api
          .readClusterRole(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'ClusterRoleBinding') {
        const k8sRbacV1Api = kc.makeApiClient(k8s.RbacAuthorizationV1Api);
        return k8sRbacV1Api
          .readClusterRoleBinding(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'Role') {
        const k8sRbacV1Api = kc.makeApiClient(k8s.RbacAuthorizationV1Api);
        return k8sRbacV1Api
          .readNamespacedRole(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'RoleBinding') {
        const k8sRbacV1Api = kc.makeApiClient(k8s.RbacAuthorizationV1Api);
        return k8sRbacV1Api
          .readNamespacedRoleBinding(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
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

/**
 * Thunk to preview a Helm Chart
 */

export const previewHelmValuesFile = createAsyncThunk<SetPreviewDataPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }>('main/previewHelmValuesFile', async (valuesFileId, thunkAPI) => {
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

        const args = {
          helmCommand: configState.settings.helmPreviewMode === 'template'
            ? `helm template -f ${valuesFile.name} ${chart.name} .`
            : `helm install -f ${valuesFile.name} ${chart.name} . --dry-run`,
          cwd: folder,
          kubeconfig,
        };

        const result = await runHelm(args);

        if (result.error) {
          return createPreviewRejection(thunkAPI, 'Helm Error', result.error);
        }

        if (result.stdout) {
          return createPreviewResult(result.stdout, valuesFile.id);
        }
      }

      return createPreviewRejection(thunkAPI, 'Helm Error', `Unabled to run Helm for ${valuesFile.name} in folder ${folder}`);
    }
  }

  return {};
});

/**
 * Invokes kustomize in main thread
 */

function runKustomize(cmd: any): any {
  return new Promise((resolve) => {
    ipcRenderer.once('kustomize-result', (event, arg) => {
      resolve(arg);
    });
    ipcRenderer.send('run-kustomize', cmd);
  });
}

/**
 * Invokes Helm in main thread
 */

function runHelm(cmd: any): any {
  return new Promise((resolve) => {
    ipcRenderer.once('helm-result', (event, arg) => {
      resolve(arg);
    });
    ipcRenderer.send('run-helm', cmd);
  });
}

/**
 * Creates a preview result from a YAML string containing resources
 */

function createPreviewResult(resourcesYaml: string, previewResourceId: string) {
  const resources = extractK8sResources(resourcesYaml, PREVIEW_PREFIX + previewResourceId);
  const resourceMap = resources.reduce((rm: ResourceMapType, r) => {
    rm[r.id] = r;
    return rm;
  }, {});

  processParsedResources(resourceMap);
  return ({previewResourceId, previewResources: clearParsedDocs(resourceMap)});
}

/**
 * Creates a preview rejection that displays an error alert
 */

function createPreviewRejection(thunkAPI: any, title: string, message: string) {
  return thunkAPI.rejectWithValue({
    alert: {
      title, message, type: AlertEnum.Error,
    },
  });
}
