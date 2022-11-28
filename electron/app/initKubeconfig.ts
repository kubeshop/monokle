import * as k8s from '@kubernetes/client-node';

import {FSWatcher, watch} from 'chokidar';
import fs from 'fs';
import log from 'loglevel';
import path from 'path';
import {AnyAction} from 'redux';

import {getKubeAccess} from '@utils/kubeclient';

import {AlertEnum} from '@shared/models/alert';
import type {KubeConfig, KubeConfigContext} from '@shared/models/config';
import electronStore from '@shared/utils/electronStore';
import {watchFunctions} from '@shared/utils/watch';

function initKubeconfig(dispatch: (action: AnyAction) => void, userHomeDir: string, kubeConfigPath?: string) {
  if (kubeConfigPath) {
    dispatch({type: 'config/setKubeConfig', payload: getKubeConfigContext(kubeConfigPath)});
    monitorKubeConfig(dispatch, kubeConfigPath);
    return;
  }

  if (process.env.KUBECONFIG) {
    const envKubeconfigParts = process.env.KUBECONFIG.split(path.delimiter);
    if (envKubeconfigParts.length > 1) {
      dispatch({type: 'config/setKubeConfig', payload: getKubeConfigContext(envKubeconfigParts[0])});
      monitorKubeConfig(dispatch, envKubeconfigParts[0]);

      dispatch({
        type: 'alert/setAlert',
        payload: {
          title: 'KUBECONFIG warning',
          message: 'Found multiple configs, selected the first one.',
          type: AlertEnum.Warning,
        },
      });
    } else {
      dispatch({type: 'config/setKubeConfig', payload: getKubeConfigContext(process.env.KUBECONFIG)});
      monitorKubeConfig(dispatch, process.env.KUBECONFIG);
    }
    return;
  }
  const storedKubeconfig: string | undefined = electronStore.get('appConfig.kubeconfig');

  if (storedKubeconfig && storedKubeconfig.trim().length > 0) {
    dispatch({type: 'config/setKubeConfig', payload: getKubeConfigContext(storedKubeconfig)});
    monitorKubeConfig(dispatch, storedKubeconfig);

    return;
  }

  const possibleKubeconfig = path.join(userHomeDir, `${path.sep}.kube${path.sep}config`);
  dispatch({type: 'config/setKubeConfig', payload: getKubeConfigContext(possibleKubeconfig)});
  monitorKubeConfig(dispatch, possibleKubeconfig);
}

export default initKubeconfig;

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

/// Kubeconfig Monitor

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
          getKubeAccess(apiObj.metadata.name, key).then(value => {
            dispatch({type: 'config/setKubeConfig', payload: getKubeConfigContext(kubeConfigPath)});
            dispatch({type: 'config/setAccessLoading', payload: true});
            dispatch({type: 'config/addNamespaceToContext', payload: value});
          });
        } else if (type === 'DELETED') {
          dispatch({type: 'config/setAccessLoading', payload: true});
          dispatch({
            type: 'config/removeNamespaceFromContext',
            payload: {namespace: apiObj.metadata.name, context: key},
          });
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
  dispatch({type: 'config/updateProjectKubeConfig', payload: kubeConfig});
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
