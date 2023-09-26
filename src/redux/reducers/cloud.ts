import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import initialState from '@redux/initialState';

import {CloudPolicyInfo, CloudProjectInfo, CloudState, CloudUser} from '@shared/models/cloud';

export const cloudSlice = createSlice({
  name: 'cloud',
  initialState: initialState.cloud,
  reducers: {
    setCloudUser: (state: Draft<CloudState>, action: PayloadAction<CloudUser | undefined>) => {
      state.user = action.payload;
    },
    setCloudProjectInfo: (state: Draft<CloudState>, action: PayloadAction<CloudProjectInfo | undefined>) => {
      state.projectInfo = action.payload;
    },
    setCloudPolicyInfo: (state: Draft<CloudState>, action: PayloadAction<CloudPolicyInfo | undefined>) => {
      state.policyInfo = action.payload;
    },
  },
});

export const {setCloudUser, setCloudPolicyInfo, setCloudProjectInfo} = cloudSlice.actions;
export default cloudSlice.reducer;
