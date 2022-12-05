import {createAsyncThunk} from '@reduxjs/toolkit';

import {ThunkApi} from '@shared/models/thunk';

import {VALIDATOR} from './validation.services';

export const loadValidation = createAsyncThunk<void, undefined, ThunkApi>(
  'validation/load',
  async (_action, {getState}) => {
    const {config} = getState().validation;

    await VALIDATOR.preload(config);
  }
);
