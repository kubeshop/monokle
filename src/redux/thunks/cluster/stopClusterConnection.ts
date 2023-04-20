import {createAsyncThunk} from '@reduxjs/toolkit';

import {setClusterProxyPort} from '@redux/appConfig';
import {disconnectFromCluster} from '@redux/services/clusterResourceWatcher';

import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';
import {closeKubectlProxy} from '@shared/utils/commands/kubectl';

export const stopClusterConnection = createAsyncThunk<void, undefined, {dispatch: AppDispatch; state: RootState}>(
  'main/stopClusterConnection',
  async (payload, {dispatch, getState}) => {
    // Close connection
    dispatch(setClusterProxyPort(undefined));
    disconnectFromCluster();
    closeKubectlProxy();
  }
);
