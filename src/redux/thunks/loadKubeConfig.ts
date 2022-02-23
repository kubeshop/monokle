import * as k8s from '@kubernetes/client-node';

import {AnyAction} from '@reduxjs/toolkit';

import fs from 'fs';
import log from 'loglevel';

import {AlertEnum} from '@models/alert';
import {KubeConfig, KubeConfigContext} from '@models/appconfig';

import {setAlert} from '@redux/reducers/alert';
import {updateProjectKubeConfig, updateProjectKubeAccess} from '@redux/reducers/appConfig';
import {addNamespace, getKubeAccess, getNamespaces} from '@utils/kubeclient';
import electronStore from '@utils/electronStore';

function getSelectedContext(contexts: k8s.Context[]): k8s.Context | undefined {
  const contextName = electronStore.get('kubeConfig.currentContext');
  let selectedContext = contexts.find(c => c.name === contextName);
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

        let selectedContext = getSelectedContext(kc.contexts);
        if (selectedContext) {
          kc.setCurrentContext(selectedContext.name);
          namespace = selectedContext.namespace;
        }

        electronStore.get('kubeConfig.currentContext');
        const kubeConfig: KubeConfig = {
          contexts: kc.contexts as KubeConfigContext[],
          currentContext: kc.currentContext,
          isPathValid: kc.contexts.length > 0,
        };

        kc.contexts.forEach((context) => {
          if (!context.namespace) {
            return;
          }

          addNamespace({
            namespaceName: context.namespace,
            clusterName: context.cluster,
          });
        });

        dispatch(updateProjectKubeConfig(kubeConfig));
        if (namespace) {
          dispatch(updateProjectKubeAccess(
            getNamespaces(selectedContext?.name as string)
              .map((ns) => getKubeAccess(ns.namespaceName)))
          );
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
