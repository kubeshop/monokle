import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {ContribState} from '@models/contrib';
import {AnyPlugin} from '@models/plugin';

import initialState from '@redux/initialState';

export const contribSlice = createSlice({
  name: 'contrib',
  initialState: initialState.contrib,
  reducers: {
    addPlugin: (state: Draft<ContribState>, action: PayloadAction<AnyPlugin>) => {
      state.plugins.push(action.payload);
    },
    setPlugins: (state: Draft<ContribState>, action: PayloadAction<AnyPlugin[]>) => {
      state.plugins = action.payload;
      state.isLoadingExistingPlugins = false;
    },
  },
});

export const {addPlugin, setPlugins} = contribSlice.actions;
export default contribSlice.reducer;
