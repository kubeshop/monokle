import {createAsyncThunk} from '@reduxjs/toolkit';

import {joinK8sResource} from '@redux/services/resource';
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

  const checkedResources = state.main.checkedResourceIdentifiers;

  const resourcesToApply = checkedResources
    .map(identifier =>
      joinK8sResource(
        state.main.resourceMetaMapByStorage[identifier.storage][identifier.id],
        state.main.resourceContentMapByStorage[identifier.storage][identifier.id]
      )
    )
    .filter(isDefined);

  applyMultipleResources(state, resourcesToApply, thunkAPI.dispatch, namespace);
});
