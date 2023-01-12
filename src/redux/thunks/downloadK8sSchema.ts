import {createAsyncThunk} from '@reduxjs/toolkit';

import log from 'loglevel';
import path from 'path';

import {updateK8sVersion} from '@redux/reducers/appConfig';
import {downloadSchema} from '@redux/services/k8sVersionService';

import {AppDispatch, RootState} from '@shared/models';

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
      thunkAPI.dispatch(updateK8sVersion(k8sVersion));
    } catch (error: any) {
      log.error(error.message);
    }
  }
);
