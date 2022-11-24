import {v4 as uuidv4} from 'uuid';

import {addTerminal, setSelectedTerminal} from '@redux/reducers/terminal';
import {setLeftBottomMenuSelection} from '@redux/reducers/ui';

import {AppDispatch} from '@shared/models/appDispatch';
import {TerminalType} from '@shared/models/terminal';
import {LeftMenuBottomSelectionType} from '@shared/models/ui';

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
