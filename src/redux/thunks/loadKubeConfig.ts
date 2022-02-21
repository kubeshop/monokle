import * as k8s from '@kubernetes/client-node';

import {AnyAction} from '@reduxjs/toolkit';

import fs from 'fs';
import log from 'loglevel';

import {AlertEnum} from '@models/alert';
import {KubeConfig, KubeConfigContext} from '@models/appconfig';

import {setAlert} from '@redux/reducers/alert';
import {updateProjectKubeConfig, updateProjectKubeAccess, updateClusterNamespaces} from '@redux/reducers/appConfig';
import {getKubeAccess} from '@utils/kubeclient';

function getSelectedContext(contexts: k8s.Context[], currentContext?: string): k8s.Context | undefined {
  let selectedContext = contexts.find(c => c.name === currentContext);
  if (selectedContext) {
    return selectedContext;
  }

  if (contexts && contexts.length) {
    return contexts[0];
  }
}

export const loadContexts = async (
  configPath: string,
  dispatch: (action: AnyAction) => void,
  currentContext?: string
) => {
  try {
    const stats = await fs.promises.stat(configPath);

    if (stats.isFile()) {
      try {
        const kc = new k8s.KubeConfig();
        kc.loadFromFile(configPath);
        let namespace: string | undefined;

        let selectedContext = getSelectedContext(kc.contexts, currentContext);
        if (selectedContext) {
          kc.setCurrentContext(selectedContext.name);
          namespace = selectedContext.namespace;
        }

        const kubeConfig: KubeConfig = {
          contexts: kc.contexts as KubeConfigContext[],
          currentContext: kc.currentContext,
          isPathValid: kc.contexts.length > 0,
        };

        dispatch(updateProjectKubeConfig(kubeConfig));
        if (namespace) {
          dispatch(updateProjectKubeAccess(getKubeAccess(namespace, kc.currentContext)));
          dispatch(updateClusterNamespaces([namespace]));
        }
      } catch (e: any) {
        if (e instanceof Error) {
          log.warn(`[loadContexts]: ${e.message}`);
        }
        dispatch(
          setAlert({
            title: 'Loading kubeconfig file failed',
            message: e.message,
            type: AlertEnum.Error,
          })
        );
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      log.warn(e.message);
    }
    dispatch(updateProjectKubeConfig({isPathValid: false}));
  }
};
