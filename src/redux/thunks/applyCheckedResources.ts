import {createAsyncThunk} from '@reduxjs/toolkit';

import {AppDispatch} from '@models/appdispatch';
import {K8sResource} from '@models/k8sresource';
import {RootState} from '@models/rootstate';

import applyMultipleResources from '@redux/services/applyMultipleResources';

export const applyCheckedResources = createAsyncThunk<
  void,
  string | undefined,
  {dispatch: AppDispatch; state: RootState}
>('main/applyCheckedResources', async (namespace, thunkAPI) => {
  const state = thunkAPI.getState();

  const checkedResources = state.main.checkedResourceIds;
  const resourceMap = state.main.resourceMap;

  const resourcesToApply = checkedResources
    .map(resource => resourceMap[resource])
    .filter((r): r is K8sResource => r !== undefined);

  applyMultipleResources(state.config, resourcesToApply, thunkAPI.dispatch, namespace);
});
