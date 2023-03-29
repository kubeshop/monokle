import {createAsyncThunk} from '@reduxjs/toolkit';

import {disconnectFromCluster} from '@redux/services/clusterResourceWatcher';

import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';

export const stopClusterConnection = createAsyncThunk<void, undefined, {dispatch: AppDispatch; state: RootState}>(
  'main/stopClusterConnection',
  async () => {
    disconnectFromCluster();
  }
);
