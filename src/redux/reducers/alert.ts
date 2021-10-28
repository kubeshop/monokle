import {createSlice, Draft, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import {AlertState, AlertType} from '@models/alert';
import initialState from '@redux/initialState';
import {mainSlice} from './main';

export const setAlert = createAsyncThunk('alert/setAlert', async (alert: AlertType, thunkAPI) => {
  thunkAPI.dispatch(mainSlice.actions.addNotification(alert));
  thunkAPI.dispatch(alertSlice.actions.addAlert(alert));
});

export const alertSlice = createSlice({
  name: 'alert',
  initialState: initialState.alert,
  reducers: {
    addAlert: (state: Draft<AlertState>, action: PayloadAction<AlertType>) => {
      state.alert = action.payload;
    },
    clearAlert: (state: Draft<AlertState>) => {
      state.alert = undefined;
    },
  },
  extraReducers: builder => {
    builder.addMatcher(
      action => true,
      (state, action) => {
        if (action.payload?.alert) {
          state.alert = action.payload.alert;
        }
      }
    );
  },
});

export const {addAlert, clearAlert} = alertSlice.actions;
export default alertSlice.reducer;
