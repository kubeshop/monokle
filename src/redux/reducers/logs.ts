import {createSlice, Draft, PayloadAction} from '@reduxjs/toolkit';

type LogsState = {
  logs: string[];
};

const initialState: LogsState = {
  logs: ['']
};

export const logsSlice = createSlice({
  name: 'logs',
  initialState,
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
