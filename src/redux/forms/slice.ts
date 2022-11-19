import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {FormsState} from '@monokle-desktop/shared/models/form';

import {initialState} from './state';

export const formSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {
    toggleForm: (state: Draft<FormsState>, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
  },
});

export const {toggleForm} = formSlice.actions;

export default formSlice.reducer;
