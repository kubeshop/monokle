import {Draft, createSlice} from '@reduxjs/toolkit';

import {UiCoachState} from '@models/uiCoach';

import initialState from '@redux/initialState';

export const uiCoachSlice = createSlice({
  name: 'uiCoach',
  initialState: initialState.uiCoach,
  reducers: {
    onUserPerformedClickOnClusterIcon: (state: Draft<UiCoachState>) => {
      state.hasUserPerformedClickOnClusterIcon = true;
    },
  },
});

export const {onUserPerformedClickOnClusterIcon} = uiCoachSlice.actions;
export default uiCoachSlice.reducer;
