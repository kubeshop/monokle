import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {ValidationIntegrationId} from '@models/integrations';
import {ValidationSliceState} from '@models/validation';

import {validationInitialState} from './validation.initialState';
import {loadValidation} from './validation.thunks';

export const validationSlice = createSlice({
  name: 'validation',
  initialState: validationInitialState,
  reducers: {
    clearValidation: (state: Draft<ValidationSliceState>) => {
      state.lastResponse = undefined;
    },

    toggleValidation: (state: Draft<ValidationSliceState>, action: PayloadAction<{id: ValidationIntegrationId}>) => {
      const {id} = action.payload;

      if (!state.config.plugins) {
        state.config.plugins = {[id]: true};
      } else {
        const previousValue = Boolean(state.config.plugins[id]);
        state.config.plugins[id] = !previousValue;
      }
    },
  },
  extraReducers: builder => {
    builder.addCase(loadValidation.pending, (state, {meta}) => {
      if (state.loadRequestId) return;
      state.status = 'loading';
      state.loadRequestId = meta.requestId;
    });

    builder.addCase(loadValidation.rejected, state => {
      state.status = 'error';
      state.loadRequestId = undefined;
    });

    builder.addCase(loadValidation.fulfilled, (state, {meta}) => {
      if (state.loadRequestId !== meta.requestId) return;
      state.status = 'loaded';
      state.loadRequestId = undefined;
    });
  },
});

export const {clearValidation, toggleValidation} = validationSlice.actions;
export default validationSlice.reducer;
