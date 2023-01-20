import {createAsyncThunk} from '@reduxjs/toolkit';

import {activeResourceMapSelector} from '@redux/selectors';
import applyMultipleResources from '@redux/thunks/applyMultipleResources';

import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';
import {isDefined} from '@shared/utils/filter';

export const applyCheckedResources = createAsyncThunk<
  void,
  {name: string; new: boolean} | undefined,
  {dispatch: AppDispatch; state: RootState}
>('main/applyCheckedResources', async (namespace, thunkAPI) => {
  const state = thunkAPI.getState();

  const checkedResources = state.main.checkedResourceIds;
  const resourceMap = activeResourceMapSelector(state);

  const resourcesToApply = checkedResources.map(resource => resourceMap[resource]).filter(isDefined);

  applyMultipleResources(state.config, resourcesToApply, thunkAPI.dispatch, namespace);
});
