import * as k8s from '@kubernetes/client-node';

import {AnyAction} from '@reduxjs/toolkit';

import fs from 'fs';
import log from 'loglevel';

import {AlertEnum, AlertType} from '@models/alert';
import {KubeConfig, KubeConfigContext} from '@models/appconfig';

import {setAlert} from '@redux/reducers/alert';
import {setAccessLoading, updateProjectKubeAccess, updateProjectKubeConfig} from '@redux/reducers/appConfig';

import electronStore from '@utils/electronStore';
import {addNamespace, getContextsWithRemovedNamespace, getKubeAccess, getNamespaces} from '@utils/kubeclient';
import {isRendererThread} from '@utils/thread';

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

const showError = (dispatch: (action: AnyAction) => void, alert: AlertType) => {
  log.warn(`[loadContexts]: ${alert.message}`);
  dispatch(setAlert(alert));
};

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

        let selectedContext = getSelectedContext(kc.contexts);
        if (selectedContext) {
          kc.setCurrentContext(selectedContext.name);
        }

        const kubeConfig: KubeConfig = {
          contexts: kc.contexts as KubeConfigContext[],
          currentContext: kc.currentContext,
          isPathValid: kc.contexts.length > 0,
        };

        const removedNamespaces = getContextsWithRemovedNamespace();
        kc.contexts.forEach(context => {
          if (!context.namespace) {
            return;
          }

          // means the user removed this default namespace
          if (removedNamespaces.includes(context.name)) {
            return;
          }

          addNamespace({
            namespaceName: context.namespace,
            clusterName: context.cluster,
          });
        });

        dispatch(updateProjectKubeConfig(kubeConfig));
        try {
          if (isRendererThread()) {
            dispatch(setAccessLoading(true));
            const namespaces = getNamespaces(selectedContext?.name as string).map(ctx => ctx.namespaceName);
            const clusterAccess = await getKubeAccess(namespaces, kc.currentContext);
            dispatch(updateProjectKubeAccess(clusterAccess));
          }
        } catch (e) {
          // error catched here
          showError(dispatch, {
            title: 'Cluster access failed',
            message: (e as Error).message,
            type: AlertEnum.Warning,
          });
          dispatch(setAccessLoading(false));
        }
      } catch (e: any) {
        // or maybe error catched here
        showError(dispatch, {
          title: 'Loading kubeconfig file failed',
          message: (e as Error).message,
          type: AlertEnum.Error,
        });
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      log.warn(e.message);
    }
    dispatch(updateProjectKubeConfig({isPathValid: false}));
  }
};
