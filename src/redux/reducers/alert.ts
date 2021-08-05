import {createSlice, Draft, PayloadAction} from '@reduxjs/toolkit';
import {AlertState, AlertType} from '@models/alert';
import initialState from '@redux/initialState';

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

export const {setAlert, clearAlert} = alertSlice.actions;
export default alertSlice.reducer;
