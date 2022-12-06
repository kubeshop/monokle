import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {trackEvent} from '@utils/telemetry';

import {FormsState, initialState} from './state';

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
