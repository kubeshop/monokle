import * as k8s from '@kubernetes/client-node';

import {AnyAction} from '@reduxjs/toolkit';

import fs from 'fs';
import log from 'loglevel';

import {AlertEnum} from '@models/alert';
import {KubeConfig, KubeConfigContext} from '@models/appconfig';

import {setAlert} from '@redux/reducers/alert';
import {updateProjectKubeConfig} from '@redux/reducers/appConfig';

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

        const selectedContext = kc.contexts.find(c => c.cluster === currentContext);
        if (selectedContext) {
          kc.setCurrentContext(selectedContext && selectedContext.cluster);
        } else {
          kc.setCurrentContext((kc.contexts && kc.contexts.length > 0 && kc.contexts[0].cluster) || '');
        }

        const kubeConfig: KubeConfig = {
          contexts: kc.contexts as KubeConfigContext[],
          currentContext: kc.currentContext,
          isPathValid: kc.contexts.length > 0,
        };

        dispatch(updateProjectKubeConfig(kubeConfig));
      } catch (e: any) {
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
    log.info(e);
    dispatch(updateProjectKubeConfig({isPathValid: false}));
  }
};
