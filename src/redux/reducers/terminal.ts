import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {TerminalState} from '@models/terminal';

import initialState from '@redux/initialState';

export const terminalSlice = createSlice({
  name: 'terminal',
  initialState: initialState.terminal,
  reducers: {
    setWebContentsId: (state: Draft<TerminalState>, action: PayloadAction<number>) => {
      state.webContentsId = action.payload;
    },
  },
});

export const {setWebContentsId} = terminalSlice.actions;
export default terminalSlice.reducer;
