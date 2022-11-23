import {createAsyncThunk} from '@reduxjs/toolkit';

import applyMultipleResources from '@redux/thunks/applyMultipleResources';

import {AppDispatch} from '@monokle-desktop/shared/models/appDispatch';
import {K8sResource} from '@monokle-desktop/shared/models/k8sResource';
import {RootState} from '@monokle-desktop/shared/models/rootState';

export const applyCheckedResources = createAsyncThunk<
  void,
  {name: string; new: boolean} | undefined,
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
