import {useCallback, useMemo} from 'react';

import {v4 as uuidv4} from 'uuid';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {addTerminal, setSelectedTerminal} from '@redux/reducers/terminal';

export function useNewTerminalMenuItems() {
  const dispatch = useAppDispatch();
  const shellsMap = useAppSelector(state => state.terminal.shellsMap);

  const items = useMemo(
    () => Object.values(shellsMap).map(shellObject => ({key: shellObject.shell, label: shellObject.name})),
    [shellsMap]
  );

  const onClick = useCallback(
    (shell: string) => {
      const newTerminalId = uuidv4();

      dispatch(setSelectedTerminal(newTerminalId));
      dispatch(addTerminal({id: newTerminalId, isRunning: false, shell}));
    },
    [dispatch]
  );

  return {items, onClick};
}
