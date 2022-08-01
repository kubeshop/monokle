import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {TerminalState, TerminalType} from '@models/terminal';

import initialState from '@redux/initialState';

export const terminalSlice = createSlice({
  name: 'terminal',
  initialState: initialState.terminal,
  reducers: {
    addTerminal: (state: Draft<TerminalState>, action: PayloadAction<TerminalType>) => {
      const {id} = action.payload;

      state.terminalsMap[id] = action.payload;
    },
    removeTerminal: (state: Draft<TerminalState>, action: PayloadAction<string>) => {
      delete state.terminalsMap[action.payload];
    },
    setRunningTerminal: (state: Draft<TerminalState>, action: PayloadAction<string>) => {
      state.terminalsMap[action.payload].isRunning = true;
    },
    setSelectedTerminal: (state: Draft<TerminalState>, action: PayloadAction<string | undefined>) => {
      state.selectedTerminal = action.payload;
    },
    setWebContentsId: (state: Draft<TerminalState>, action: PayloadAction<number>) => {
      state.webContentsId = action.payload;
    },
  },
});

export const {addTerminal, removeTerminal, setRunningTerminal, setSelectedTerminal, setWebContentsId} =
  terminalSlice.actions;
export default terminalSlice.reducer;
