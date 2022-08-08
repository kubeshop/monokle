import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {ShellsMapType, TerminalSettingsType, TerminalState, TerminalType} from '@models/terminal';

import initialState from '@redux/initialState';
import {AppListenerFn} from '@redux/listeners/base';

import electronStore from '@utils/electronStore';

import {setLeftBottomMenuSelection} from './ui';

export const terminalSlice = createSlice({
  name: 'terminal',
  initialState: initialState.terminal,
  reducers: {
    addTerminal: (state: Draft<TerminalState>, action: PayloadAction<TerminalType>) => {
      const {id} = action.payload;

      state.terminalsMap[id] = action.payload;
    },
    removeTerminal: (state: Draft<TerminalState>, action: PayloadAction<string>) => {
      const id = action.payload;

      if (id === state.selectedTerminal && Object.keys(state.terminalsMap).length > 1) {
        const index = Object.keys(state.terminalsMap).indexOf(id);

        const switchTerminalId = Object.keys(state.terminalsMap)[index + 1]
          ? Object.keys(state.terminalsMap)[index + 1]
          : Object.keys(state.terminalsMap)[index - 1];

        state.selectedTerminal = switchTerminalId;
      }

      delete state.terminalsMap[id];
    },
    setRunningTerminal: (state: Draft<TerminalState>, action: PayloadAction<string>) => {
      state.terminalsMap[action.payload].isRunning = true;
    },
    setSelectedTerminal: (state: Draft<TerminalState>, action: PayloadAction<string | undefined>) => {
      state.selectedTerminal = action.payload;
    },
    setShells: (state: Draft<TerminalState>, action: PayloadAction<ShellsMapType>) => {
      state.shellsMap = action.payload;
    },
    setTerminalSettings: (state: Draft<TerminalState>, action: PayloadAction<TerminalSettingsType>) => {
      state.settings = action.payload;
      electronStore.set('terminal.settings', action.payload);
    },
    setWebContentsId: (state: Draft<TerminalState>, action: PayloadAction<number>) => {
      state.webContentsId = action.payload;
    },
  },
});

export const {
  addTerminal,
  removeTerminal,
  setRunningTerminal,
  setSelectedTerminal,
  setShells,
  setTerminalSettings,
  setWebContentsId,
} = terminalSlice.actions;
export default terminalSlice.reducer;

/* * * * * * * * * * * * * *
 * Listeners
 * * * * * * * * * * * * * */

export const removedTerminalListener: AppListenerFn = listen => {
  listen({
    type: removeTerminal.type,
    effect: async (_action, {dispatch, getState}) => {
      const terminalsMap = getState().terminal.terminalsMap;

      if (!Object.keys(terminalsMap).length) {
        dispatch(setLeftBottomMenuSelection(null));
        dispatch(setSelectedTerminal(undefined));
      }
    },
  });
};
