import {createAsyncThunk} from '@reduxjs/toolkit';

import {K8sResource} from '@models/k8sresource';

import applyMultipleResources from '@redux/services/applyMultipleResources';
import {AppDispatch, RootState} from '@redux/store';

export const applyCheckedResources = createAsyncThunk<void, undefined, {dispatch: AppDispatch; state: RootState}>(
  'main/applyCheckedResources',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();

    const checkedResources = state.main.checkedResourceIds;
    const resourceMap = state.main.resourceMap;

    const resourcesToApply = checkedResources
      .map(resource => resourceMap[resource])
      .filter((r): r is K8sResource => r !== undefined);

    applyMultipleResources(state.config, resourcesToApply, thunkAPI.dispatch);
  }
);
