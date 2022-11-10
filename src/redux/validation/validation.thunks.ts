import {createAsyncThunk} from '@reduxjs/toolkit';

import {ThunkApi} from '@monokle-desktop/shared';

import {VALIDATOR} from './validation.services';

export const loadValidation = createAsyncThunk<void, undefined, ThunkApi>(
  'validation/load',
  async (_action, {getState}) => {
    const {config} = getState().validation;

    await VALIDATOR.preload(config);
  }
);
