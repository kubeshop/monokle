import {createAsyncThunk} from '@reduxjs/toolkit';

import {v4 as uuidv4} from 'uuid';

import {addTerminal, setSelectedTerminal} from '@redux/reducers/terminal';
import {setLeftBottomMenuSelection} from '@redux/reducers/ui';

import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';

export const addDefaultTerminalCommand = createAsyncThunk<void, string, {dispatch: AppDispatch; state: RootState}>(
  'terminal/addDefaultTerminalCommand',
  async (defaultCommand, thunkAPI) => {
    const state = thunkAPI.getState();
    const bottomSelection = state.ui.leftMenu.bottomSelection;
    const shell = state.terminal.settings.defaultShell;
    const terminalsMap = state.terminal.terminalsMap;

    // check if there is a terminal with same default command
    const foundTerminal = Object.values(terminalsMap).find(terminal => terminal.defaultCommand === defaultCommand);

    if (foundTerminal) {
      thunkAPI.dispatch(setSelectedTerminal(foundTerminal.id));
    } else {
      const newTerminalId = uuidv4();
      thunkAPI.dispatch(setSelectedTerminal(newTerminalId));
      thunkAPI.dispatch(
        addTerminal({
          id: newTerminalId,
          isRunning: false,
          defaultCommand,
          shell,
        })
      );
    }

    if (!bottomSelection || bottomSelection !== 'terminal') {
      thunkAPI.dispatch(setLeftBottomMenuSelection('terminal'));
    }
  }
);
