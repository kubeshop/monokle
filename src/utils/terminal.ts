import {v4 as uuidv4} from 'uuid';

import {AppDispatch} from '@models/appdispatch';
import {TerminalType} from '@models/terminal';
import {LeftMenuBottomSelectionType} from '@models/ui';

import {addTerminal, setSelectedTerminal} from '@redux/reducers/terminal';
import {setLeftBottomMenuSelection} from '@redux/reducers/ui';

export const addDefaultCommandTerminal = (
  terminalsMap: Record<string, TerminalType>,
  defaultCommand: string,
  shell: string,
  bottomSelection: LeftMenuBottomSelectionType | undefined,
  dispatch: AppDispatch
) => {
  // check if there is a terminal with same default command
  const foundTerminal = Object.values(terminalsMap).find(terminal => terminal.defaultCommand === defaultCommand);

  if (foundTerminal) {
    dispatch(setSelectedTerminal(foundTerminal.id));
  } else {
    const newTerminalId = uuidv4();
    dispatch(setSelectedTerminal(newTerminalId));
    dispatch(
      addTerminal({
        id: newTerminalId,
        isRunning: false,
        defaultCommand,
        shell,
      })
    );
  }

  if (!bottomSelection || bottomSelection !== 'terminal') {
    dispatch(setLeftBottomMenuSelection('terminal'));
  }
};
