import * as k8s from '@kubernetes/client-node';

import {createAsyncThunk} from '@reduxjs/toolkit';

import fs from 'fs';
import log from 'loglevel';

import {KubeConfig, KubeConfigContext} from '@models/kubeConfig';

import {AppDispatch, RootState} from '@redux/store';

import {createRejectionWithAlert} from './utils';

export const loadContexts = createAsyncThunk<
  any,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/loadContexts', async (configPath: string, thunkAPI: any) => {
  try {
    const stats = await fs.promises.stat(configPath);

    if (stats.isFile()) {
      try {
        const kc = new k8s.KubeConfig();
        kc.loadFromFile(configPath);

        const kubeConfig: KubeConfig = {
          contexts: kc.contexts as KubeConfigContext[],
          currentContext: kc.currentContext,
        };
        return kubeConfig;
      } catch (e: any) {
        return createRejectionWithAlert(thunkAPI, 'Loading kubeconfig file failed', e.message);
      }
    }
  } catch (e) {
    log.info(e);
  }
  return thunkAPI.reject();
});
