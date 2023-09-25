import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import initialState from '@redux/initialState';

import {CloudState, CloudUser} from '@shared/models/cloud';

export const cloudSlice = createSlice({
  name: 'cloud',
  initialState: initialState.cloud,
  reducers: {
    setCloudUser: (state: Draft<CloudState>, action: PayloadAction<CloudUser | undefined>) => {
      state.user = action.payload;
    },
  },
});

export const {setCloudUser} = cloudSlice.actions;
export default cloudSlice.reducer;
