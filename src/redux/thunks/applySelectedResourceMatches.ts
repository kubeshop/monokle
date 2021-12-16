import {createAsyncThunk} from '@reduxjs/toolkit';

import {K8sResource} from '@models/k8sresource';

import {reloadClusterDiff} from '@redux/reducers/main';
import applyMultipleResources from '@redux/services/applyMultipleResources';
import {AppDispatch, RootState} from '@redux/store';

export const applySelectedResourceMatches = createAsyncThunk<
  void,
  undefined,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/applySelectedResourceMatches', async (_, thunkAPI) => {
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

  applyMultipleResources(state.config, resourcesToApply, thunkAPI.dispatch, () => {
    thunkAPI.dispatch(reloadClusterDiff());
  });
});
