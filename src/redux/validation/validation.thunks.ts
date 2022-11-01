import {createAsyncThunk} from '@reduxjs/toolkit';

import {ThunkApi} from '@models/thunk';

import {VALIDATOR} from './validation.services';

export const loadValidation = createAsyncThunk<void, undefined, ThunkApi>(
  'validation/load',
  async (_action, {getState, requestId}) => {
    const {loadRequestId, config} = getState().validation;

    if (requestId !== loadRequestId) {
      return;
    }

    VALIDATOR.configureFile({settings: {debug: true}});
    VALIDATOR.configureArgs(config);
    await VALIDATOR.preload();
  }
);
