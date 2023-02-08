// TODO: THIS FILE WILL BE DELETED AFTER UI 2.0
import * as k8s from '@kubernetes/client-node';

import {FSWatcher, watch} from 'chokidar';
import fs from 'fs';
import log from 'loglevel';
import {AnyAction} from 'redux';

import {setAlert} from '@redux/reducers/alert';
import {
  addNamespaceToContext,
  removeNamespaceFromContext,
  setAccessLoading,
  updateProjectKubeConfig,
} from '@redux/reducers/appConfig';

import {AlertEnum} from '@shared/models/alert';
import {KubeConfig, KubeConfigContext} from '@shared/models/config';
import {getKubeAccess} from '@shared/utils/kubeclient';
import {watchFunctions} from '@shared/utils/watch';

let watcher: FSWatcher;
let clusterNamespacesWatchInterval: number | null = null;

// Contains all namespace watchers and its requests by cluster name as Object key
let kubeConfigList: Record<string, {watcher: k8s.Watch | undefined; req: any}> = {};

export async function monitorKubeConfig(dispatch: (action: AnyAction) => void, filePath?: string) {
  if (watcher) {
    watcher.close();
  }

  if (!filePath) {
    return;
  }

  reinitializeWatchers(filePath, dispatch);

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
  } catch (e: any) {
    log.error('monitorKubeConfigError', e.message);
  }
}

export const reinitializeWatchers = (filePath: string, dispatch: (action: AnyAction) => void) => {
  readAndNotifyKubeConfig(filePath, dispatch);
  if (clusterNamespacesWatchInterval) {
    clearInterval(clusterNamespacesWatchInterval);
  }
  clusterNamespacesWatchInterval = null;
  watchAllClusterNamespaces(filePath, dispatch);
};

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
          getKubeAccess(apiObj.metadata.name, key)
            .then(value => {
              dispatch(setAccessLoading(true));
              dispatch(addNamespaceToContext(value));
            })
            .catch(() => {
              dispatch(
                setAlert({
                  type: AlertEnum.Warning,
                  title: 'Cluster Watcher Error',
                  message:
                    "We're unable to watch for namespaces changes in your cluster. This may be due to a lack of permissions.",
                })
              );
              dispatch(setAccessLoading(false));
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
