import {createAsyncThunk} from '@reduxjs/toolkit';

import log from 'loglevel';
import path from 'path';

import {downloadSchema} from '@redux/services/k8sVersionService';

import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';

export const downloadK8sSchema = createAsyncThunk<void, string, {dispatch: AppDispatch; state: RootState}>(
  'config/downloadK8sSchema',
  async (k8sVersion, thunkAPI) => {
    const state = thunkAPI.getState();
    const userDataDir = state.config.userDataDir;
    try {
      await downloadSchema(
        `https://raw.githubusercontent.com/yannh/kubernetes-json-schema/master/v${k8sVersion}/_definitions.json`,
        path.join(String(userDataDir), path.sep, 'schemas', `${k8sVersion}.json`)
      );
    } catch (error: any) {
      log.error(error.message);
    }
  }
);
