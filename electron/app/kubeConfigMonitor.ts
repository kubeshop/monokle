import * as k8s from '@kubernetes/client-node';

import {webContents} from 'electron';

import {FSWatcher, watch} from 'chokidar';
import fs from 'fs';
import {AnyAction} from 'redux';

import {KubeConfig, KubeConfigContext} from '@models/appconfig';

import {
  addNamespaceToContext,
  removeNamespaceFromContext,
  setAccessLoading,
  updateProjectKubeConfig,
} from '@redux/reducers/appConfig';

import {watchFunctions} from '@utils/helpers';
import {getKubeAccess} from '@utils/kubeclient';

let watcher: FSWatcher;
let clusterNamespacesWatchInterval: number | null = null;

// Contains all namespace watchers and its requests by cluster name as Object key
let kubeConfigList: Record<string, {watcher: k8s.Watch | undefined; req: any}> = {};

export async function monitorKubeConfig(filePath: string, dispatch: (action: AnyAction) => void) {
  if (watcher) {
    watcher.close();
  }

  readAndNotifyKubeConfig(filePath, dispatch);
  watchAllClusterNamespaces(filePath, dispatch);

  webContents.getFocusedWebContents().on('did-finish-load', () => {
    readAndNotifyKubeConfig(filePath, dispatch);
    if (clusterNamespacesWatchInterval) {
      clearInterval(clusterNamespacesWatchInterval);
    }
    clusterNamespacesWatchInterval = null;
    watchAllClusterNamespaces(filePath, dispatch);
  });

  try {
    const stats = await fs.promises.stat(filePath);
    if (stats.isFile()) {
      watcher = watch(filePath, {
        persistent: true,
        usePolling: true,
        interval: 1000,
        ignoreInitial: true,
      });

      watcher.on('all', (type: string) => {
        if (type === 'unlink') {
          watcher.close();
          readAndNotifyKubeConfig('', dispatch);
          watchAllClusterNamespaces('', dispatch);
          return;
        }
        readAndNotifyKubeConfig(filePath, dispatch);
        watchAllClusterNamespaces(filePath, dispatch);
      });
    }
  } catch (e) {
    //
  }
}

export function watchK8sNamespaces(
  kubeConfigPath: string,
  contexts: Array<k8s.Context>,
  dispatch: (action: AnyAction) => void
) {
  Object.keys(kubeConfigList).forEach((key: string) => {
    if (kubeConfigList[key]) {
      kubeConfigList[key].req.abort();
      delete kubeConfigList[key];
    }
  });

  contexts.forEach(context => {
    if (!kubeConfigList[context.name]) {
      kubeConfigList[context.name] = {
        watcher: undefined,
        req: undefined,
      };
      watchNamespaces(kubeConfigPath, context.name, dispatch);
    }
  });
}

export function watchNamespaces(kubeConfigPath: string, key: string, dispatch: (action: AnyAction) => void) {
  const kc = new k8s.KubeConfig();
  kc.loadFromFile(kubeConfigPath);
  kc.setCurrentContext(key);
  kubeConfigList[key].watcher = new k8s.Watch(kc);
  kubeConfigList[key].watcher
    ?.watch(
      '/api/v1/namespaces',
      {allowWatchBookmarks: true},
      (type: string, apiObj: any) => {
        if (type === 'ADDED') {
          getKubeAccess(apiObj.metadata.name, key).then(value => {
            dispatch(setAccessLoading(true));
            dispatch(addNamespaceToContext(value));
          });
        } else if (type === 'DELETED') {
          dispatch(setAccessLoading(true));
          dispatch(removeNamespaceFromContext({namespace: apiObj.metadata.name, context: key}));
        }
      },
      () => {
        if (kubeConfigList[key]) {
          kubeConfigList[key].req.abort();
          delete kubeConfigList[key];
        }
      }
    )
    .then((req: any) => {
      kubeConfigList[key].req = req;
    });
}

const readAndNotifyKubeConfig = (kubeConfigPath: string, dispatch: (action: AnyAction) => void) => {
  const kubeConfig: KubeConfig = getKubeConfigContext(kubeConfigPath);
  dispatch(updateProjectKubeConfig(kubeConfig));
};

export function watchAllClusterNamespaces(kubeConfigPath: string, dispatch: (action: AnyAction) => void) {
  if (clusterNamespacesWatchInterval) {
    return;
  }

  kubeConfigList = {};

  clusterNamespacesWatchInterval = watchFunctions(() => {
    try {
      const kc = new k8s.KubeConfig();
      kc.loadFromFile(kubeConfigPath);
      watchK8sNamespaces(kubeConfigPath, kc.contexts, dispatch);
    } catch (error) {
      Object.keys(kubeConfigList).forEach((key: string) => {
        if (kubeConfigList && kubeConfigList[key] && kubeConfigList[key].req) {
          kubeConfigList[key].req.abort();
          delete kubeConfigList[key];
        }
      });
    }
  }, 60 * 60 * 1000);
}

export const getKubeConfigContext = (configPath: string): KubeConfig => {
  try {
    const kc = new k8s.KubeConfig();
    kc.loadFromFile(configPath);

    return {
      path: configPath,
      currentContext: kc.getCurrentContext(),
      isPathValid: kc.contexts.length > 0,
      contexts: kc.contexts as KubeConfigContext[],
    };
  } catch (error) {
    return {
      path: configPath,
      isPathValid: false,
      contexts: [],
    };
  }
};
