import {ipcRenderer} from 'electron';

import {Draft, PayloadAction, createSlice, isAnyOf} from '@reduxjs/toolkit';

import {setOpenProject} from '@redux/appConfig';
import initialState from '@redux/initialState';
import {AppListenerFn} from '@redux/listeners/base';

import {ShellsMapType, TerminalSettingsType, TerminalState, TerminalType} from '@shared/models/terminal';
import electronStore from '@shared/utils/electronStore';

import {toggleStartProjectPane} from './ui';

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
    setTerminalHeight: (state: Draft<TerminalState>, action: PayloadAction<number>) => {
      state.height = action.payload;
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
  setTerminalHeight,
} = terminalSlice.actions;
export default terminalSlice.reducer;

/* * * * * * * * * * * * * *
 * Listeners
 * * * * * * * * * * * * * */

export const killTerminalProcessesListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(toggleStartProjectPane, setOpenProject.pending),
    effect: async (_action, {dispatch, getState}) => {
      const terminalsIds = Object.keys(getState().terminal.terminalsMap);

      if (!terminalsIds.length) return;

      ipcRenderer.send('shell.ptyProcessKillAll');
      dispatch(setSelectedTerminal(undefined));
    },
  });
};
