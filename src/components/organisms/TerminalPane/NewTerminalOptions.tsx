import {v4 as uuidv4} from 'uuid';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {addTerminal, setSelectedTerminal} from '@redux/reducers/terminal';

import * as S from './NewTerminalOptions.styled';

const NewTerminalOptions: React.FC = () => {
  const dispatch = useAppDispatch();
  const shellsMap = useAppSelector(state => state.terminal.shellsMap);

  const onAddNewTerminalHandler = (shell: string) => {
    const newTerminalId = uuidv4();

    dispatch(setSelectedTerminal(newTerminalId));
    dispatch(addTerminal({id: newTerminalId, isRunning: false, shell}));
  };

  return (
    <S.Menu
      items={Object.values(shellsMap).map(shellObject => ({key: shellObject.shell, label: shellObject.name}))}
      onClick={menuItem => onAddNewTerminalHandler(menuItem.key)}
    />
  );
};

export default NewTerminalOptions;
