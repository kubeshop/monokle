import {createAsyncThunk} from '@reduxjs/toolkit';

import {AppDispatch} from '@models/appdispatch';
import {K8sResource} from '@models/k8sresource';
import {RootState} from '@models/rootstate';

import {reloadClusterDiff} from '@redux/reducers/main';
import applyMultipleResources from '@redux/services/applyMultipleResources';

export const applySelectedResourceMatches = createAsyncThunk<
  void,
  {name: string; new: boolean} | undefined,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/applySelectedResourceMatches', async (namespace, thunkAPI) => {
  const state = thunkAPI.getState();

  const matches = state.main.clusterDiff.clusterToLocalResourcesMatches;
  const resourceMap = state.main.resourceMap;
  const selectedMatches = state.main.clusterDiff.selectedMatches;

  const resourcesToApply = matches
    .filter(match => selectedMatches.includes(match.id))
    .map(match =>
      match.localResourceIds && match.localResourceIds.length > 0 ? resourceMap[match.localResourceIds[0]] : undefined
    )
    .filter((r): r is K8sResource => r !== undefined);

  applyMultipleResources(state.config, resourcesToApply, thunkAPI.dispatch, namespace, () => {
    thunkAPI.dispatch(reloadClusterDiff());
  });
});
