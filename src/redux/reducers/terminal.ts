import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {TerminalState} from '@models/terminal';

import initialState from '@redux/initialState';

export const terminalSlice = createSlice({
  name: 'terminal',
  initialState: initialState.terminal,
  reducers: {
    addRunningTerminal: (state: Draft<TerminalState>, action: PayloadAction<string>) => {
      state.runningTerminals.push(action.payload);
    },
    removeRunningTerminal: (state: Draft<TerminalState>, action: PayloadAction<string>) => {
      state.runningTerminals = state.runningTerminals.filter(id => id !== action.payload);
    },
    setWebContentsId: (state: Draft<TerminalState>, action: PayloadAction<number>) => {
      state.webContentsId = action.payload;
    },
  },
});

export const {addRunningTerminal, removeRunningTerminal, setWebContentsId} = terminalSlice.actions;
export default terminalSlice.reducer;
