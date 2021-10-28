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
>('main/loadContexts', async (configPath: string, thunkAPI: any) => {
  try {
    const stats = await fs.promises.stat(configPath);

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
        return createRejectionWithAlert(thunkAPI, 'Loading kubeconfig file failed', e.message);
      }
    }
  } catch (e) {
    //
  }

  return thunkAPI.reject();
});
