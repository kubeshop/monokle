import {createAsyncThunk} from '@reduxjs/toolkit';
import {AppDispatch, RootState} from '@redux/store';
import * as k8s from '@kubernetes/client-node';
import {KubeConfig, KubeConfigContext} from '@models/kubeConfig';
import fs from 'fs';
import {createRejectionWithAlert} from './utils';

export const loadContexts = createAsyncThunk<
  any,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/loadContexts', (configPath: string, thunkAPI: any) => {
  const stats = fs.statSync(configPath);

  if (stats.isFile()) {
    try {
      const kc = new k8s.KubeConfig();
      kc.loadFromFile(configPath);

      const kubeConfig: KubeConfig = {
        contexts: <Array<KubeConfigContext>>kc.contexts,
        currentContext: kc.currentContext,
      };
      return kubeConfig;
    } catch (e: any) {
      return createRejectionWithAlert(thunkAPI, 'Loading kube config file failed', e.message);
    }
  }

  return thunkAPI.reject();
});
