import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import initialState from '@redux/initialState';
import {AppListenerFn} from '@redux/listeners/base';

import {AlertState, AlertType} from '@shared/models/alert';

export const alertSlice = createSlice({
  name: 'alert',
  initialState: initialState.alert,
  reducers: {
    setAlert: (state: Draft<AlertState>, action: PayloadAction<AlertType>) => {
      state.alert = action.payload;
    },
    clearAlert: (state: Draft<AlertState>) => {
      state.alert = undefined;
    },
    testSyncAction: () => {
      console.log('Some sync action');
    },
    triggerTestAsyncAction: () => {
      console.log('Dispatching a sync action to trigger an async listener');
    },
  },
  extraReducers: builder => {
    builder.addMatcher(
      () => true,
      (state, action) => {
        if (action.payload?.alert) {
          state.alert = action.payload.alert;
        }
      }
    );
  },
});

export const {setAlert, clearAlert, testSyncAction, triggerTestAsyncAction} = alertSlice.actions;
export default alertSlice.reducer;

export const testAsyncListener: AppListenerFn = listen => {
  listen({
    actionCreator: triggerTestAsyncAction,
    effect: async (action, {getState, dispatch}) => {
      console.log('doing some async action, with access to getState and dispatch');
    },
  });
};
