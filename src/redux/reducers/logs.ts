import {createSlice, Draft, PayloadAction} from '@reduxjs/toolkit';
import {LogsState} from '@models/logs';
import initialState from '@redux/initialState';

export const logsSlice = createSlice({
  name: 'logs',
  initialState: initialState.logs,
  reducers: {
    setLogs: (state: Draft<LogsState>, action: PayloadAction<string[]>) => {
      state.logs = state.logs.concat(action.payload);
    },
    clearLogs: (state: Draft<LogsState>) => {
      state.logs = [];
    },
  },
});

export const {setLogs, clearLogs} = logsSlice.actions;
export default logsSlice.reducer;
