import {createAsyncThunk} from '@reduxjs/toolkit';

import applyMultipleResources from '@redux/thunks/applyMultipleResources';

import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';
import {isDefined} from '@shared/utils/filter';
import {findResourceInStorage} from '@shared/utils/resource';

export const applyCheckedResources = createAsyncThunk<
  void,
  {name: string; new: boolean} | undefined,
  {dispatch: AppDispatch; state: RootState}
>('main/applyCheckedResources', async (namespace, thunkAPI) => {
  const state = thunkAPI.getState();

  const checkedResources = state.main.checkedResourceIdentifiers;

  const resourcesToApply = checkedResources
    .map(identifier =>
      findResourceInStorage(identifier, {
        metaStorage: state.main.resourceMetaStorage,
        contentStorage: state.main.resourceContentStorage,
      })
    )
    .filter(isDefined);

  applyMultipleResources(state.config, resourcesToApply, thunkAPI.dispatch, namespace);
});
