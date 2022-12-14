import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {FormsState} from '@shared/models/form';
import {trackEvent} from '@shared/utils/telemetry';

import {initialState} from './state';

export const formSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {
    toggleForm: (state: Draft<FormsState>, action: PayloadAction<boolean>) => {
      if (action.payload) {
        trackEvent('edit/side_by_side_editor');
      }
      state.isOpen = action.payload;
    },
  },
});

export const {toggleForm} = formSlice.actions;

export default formSlice.reducer;
