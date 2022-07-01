import * as k8s from '@kubernetes/client-node';

import {FSWatcher, watch} from 'chokidar';
import fs from 'fs';
import {AnyAction} from 'redux';

import {KubeConfig, KubeConfigContext} from '@models/appconfig';

import {addNamespaceToContext, removeNamespaceFromContext, updateProjectKubeConfig} from '@redux/reducers/appConfig';

import {watchFunctions} from '@utils/helpers';

let watcher: FSWatcher;

export async function monitorKubeConfig(filePath: string, dispatch: (action: AnyAction) => void) {
  if (watcher) {
    watcher.close();
  }

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
          watchK8sClusters('', dispatch);
          watchAllClusterNamespaces('', dispatch);
          return;
        }
        watchK8sClusters(filePath, dispatch);
        watchAllClusterNamespaces(filePath, dispatch);
      });
    }
  } catch (e) {
    //
  }
}

const kubeConfigList: {[key: string]: any} = {};

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
      kubeConfigList[context.name] = {};
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
    .watch(
      '/api/v1/namespaces',
      {allowWatchBookmarks: true},
      (type: string, apiObj: any) => {
        if (type === 'ADDED') {
          dispatch(addNamespaceToContext({namespace: apiObj.metadata.name, context: key}));
        } else if (type === 'DELETED') {
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

let k8sClusterWatchInterval: number | null = null;

export function watchK8sClusters(kubeConfigPath: string, dispatch: (action: AnyAction) => void) {
  if (k8sClusterWatchInterval) {
    return;
  }

  k8sClusterWatchInterval = watchFunctions(() => {
    const kubeConfig: KubeConfig = getKubeConfigContext(kubeConfigPath);
    dispatch(updateProjectKubeConfig(kubeConfig));
  }, 5000);
}

let clusterNamespacesWatchInterval: number | null = null;

export function watchAllClusterNamespaces(kubeConfigPath: string, dispatch: (action: AnyAction) => void) {
  if (clusterNamespacesWatchInterval) {
    return;
  }

  clusterNamespacesWatchInterval = watchFunctions(() => {
    try {
      const kc = new k8s.KubeConfig();
      kc.loadFromFile(kubeConfigPath);
      watchK8sNamespaces(kubeConfigPath, kc.contexts, dispatch);
    } catch (error) {
      Object.keys(kubeConfigList).forEach((key: string) => {
        if (kubeConfigList[key]) {
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
