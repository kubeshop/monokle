import * as k8s from '@kubernetes/client-node';

import path from 'path';
import {AnyAction} from 'redux';

import {AlertEnum} from '@models/alert';
import {KubeConfig, KubeConfigContext} from '@models/appconfig';

import {setAlert} from '@redux/reducers/alert';
import {
  addNamespaceToContext,
  removeNamespaceFromContext,
  setKubeConfig,
  updateProjectKubeConfig,
} from '@redux/reducers/appConfig';
import {monitorKubeConfig} from '@redux/services/kubeConfigMonitor';

import electronStore from '@utils/electronStore';

function initKubeconfig(dispatch: (action: AnyAction) => void, userHomeDir: string) {
  if (process.env.KUBECONFIG) {
    const envKubeconfigParts = process.env.KUBECONFIG.split(path.delimiter);
    if (envKubeconfigParts.length > 1) {
      dispatch(setKubeConfig(getKubeConfigContext(envKubeconfigParts[0], dispatch)));
      monitorKubeConfig(envKubeconfigParts[0], dispatch);

      dispatch(
        setAlert({
          title: 'KUBECONFIG warning',
          message: 'Found multiple configs, selected the first one.',
          type: AlertEnum.Warning,
        })
      );
    } else {
      dispatch(setKubeConfig(getKubeConfigContext(process.env.KUBECONFIG, dispatch)));
      monitorKubeConfig(process.env.KUBECONFIG, dispatch);
    }
    return;
  }
  const storedKubeconfig: string | undefined = electronStore.get('appConfig.kubeconfig');

  if (storedKubeconfig && storedKubeconfig.trim().length > 0) {
    dispatch(setKubeConfig(getKubeConfigContext(storedKubeconfig, dispatch)));
    monitorKubeConfig(storedKubeconfig, dispatch);
    return;
  }

  const possibleKubeconfig = path.join(userHomeDir, `${path.sep}.kube${path.sep}config`);
  dispatch(setKubeConfig(getKubeConfigContext(possibleKubeconfig, dispatch)));
  monitorKubeConfig(possibleKubeconfig, dispatch);
}

export default initKubeconfig;

export const getKubeConfigContext = (configPath: string, dispatch: (action: AnyAction) => void): KubeConfig => {
  try {
    const kc = new k8s.KubeConfig();
    kc.loadFromFile(configPath);
    watchK8sClusters(configPath, dispatch);
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

const kubeConfigList: {[key: string]: any} = {};

export function watchK8sNamespaces(
  kubeConfigPath: string,
  contexts: Array<k8s.Context>,
  dispatch: (action: AnyAction) => void
) {
  contexts.forEach(context => {
    if (!kubeConfigList[context.name]) {
      kubeConfigList[context.name] = {};
      watchNamespaces(kubeConfigPath, context.name, dispatch);
    }
  });

  Object.keys(kubeConfigList).forEach((key: string) => {
    if (contexts.findIndex(c => c.name === key) === -1) {
      kubeConfigList[key].req.abort();
      delete kubeConfigList[key];
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
      (err: any) => {
        console.log(err);
      }
    )
    .then((req: any) => {
      kubeConfigList[key].req = req;
    });
}

let k8sClusterWatchInterval: NodeJS.Timer | null = null;

export function watchK8sClusters(kubeConfigPath: string, dispatch: (action: AnyAction) => void) {
  if (k8sClusterWatchInterval) {
    return;
  }

  k8sClusterWatchInterval = setInterval(() => {
    const kc = new k8s.KubeConfig();
    kc.loadFromFile(kubeConfigPath);
    const kubeConfig: KubeConfig = {
      contexts: kc.contexts as KubeConfigContext[],
      currentContext: kc.currentContext,
      isPathValid: kc.clusters.length > 0,
    };
    watchK8sNamespaces(kubeConfigPath, kc.contexts, dispatch);
    dispatch(updateProjectKubeConfig(kubeConfig));
  }, 5000);
}
