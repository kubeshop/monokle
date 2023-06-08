import {createAsyncThunk} from '@reduxjs/toolkit';

import {clearPreviewAndSelectionHistory} from '@redux/reducers/main';

import {AppDispatch} from '@shared/models/appDispatch';

export const stopPreview = createAsyncThunk<void, undefined, {dispatch: AppDispatch}>(
  'main/stopPreview',
  async (_, thunkAPI) => {
    thunkAPI.dispatch(clearPreviewAndSelectionHistory());
  }
);
