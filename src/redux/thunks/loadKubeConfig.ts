import * as k8s from '@kubernetes/client-node';

import {AnyAction} from '@reduxjs/toolkit';

import fs from 'fs';
import log from 'loglevel';

import {AlertEnum} from '@models/alert';
import {KubeConfig, KubeConfigContext} from '@models/kubeConfig';

import {setAlert} from '@redux/reducers/alert';
import {setContexts} from '@redux/reducers/appConfig';

export const loadContexts = async (configPath: string, dispatch: (action: AnyAction) => void) => {
  try {
    const stats = await fs.promises.stat(configPath);

    if (stats.isFile()) {
      try {
        console.log('configPath', configPath);
        const kc = new k8s.KubeConfig();
        kc.loadFromFile(configPath);

        const kubeConfig: KubeConfig = {
          contexts: kc.contexts as KubeConfigContext[],
          currentContext: kc.currentContext,
        };
        dispatch(setContexts(kubeConfig));
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
  }
};
