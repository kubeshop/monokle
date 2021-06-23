import {createSlice, Draft, PayloadAction} from '@reduxjs/toolkit';
import {AlertType} from '@models/alert';

type AlertState = {
  alert?: AlertType;
};

const initialState: AlertState = {};

export const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    setAlert: (state: Draft<AlertState>, action: PayloadAction<AlertType>) => {
      state.alert = action.payload;
    },
    clearAlert: (state: Draft<AlertState>) => {
      state.alert = undefined;
    },
  },
});

export const {setAlert, clearAlert} = alertSlice.actions;
export default alertSlice.reducer;
