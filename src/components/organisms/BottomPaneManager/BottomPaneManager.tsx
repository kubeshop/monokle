import React, {useEffect} from 'react';

import {v4 as uuidv4} from 'uuid';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {addTerminal, setSelectedTerminal} from '@redux/reducers/terminal';

import TerminalPane from '../TerminalPane';
import * as S from './BottomPaneManager.styled';

const BottomPaneManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const selectedTerminal = useAppSelector(state => state.terminal.selectedTerminal);
  const terminalsMap = useAppSelector(state => state.terminal.terminalsMap);

  // treat the case where the bottom selection is first set to terminal or terminal was already opened
  useEffect(() => {
    if (selectedTerminal || bottomSelection !== 'terminal') {
      return;
    }

    const newTerminalId = uuidv4();
    dispatch(setSelectedTerminal(newTerminalId));
    dispatch(addTerminal({id: newTerminalId, isRunning: false}));
  }, [bottomSelection, dispatch, selectedTerminal]);

  return (
    <S.BottomPaneManagerContainer>
      {Object.keys(terminalsMap).length > 1 ? (
        <S.TabsContainer>
          {Object.keys(terminalsMap).map((id, index) => (
            <S.Tab key={id} $selected={selectedTerminal === id} onClick={() => dispatch(setSelectedTerminal(id))}>
              Terminal {index}
            </S.Tab>
          ))}
        </S.TabsContainer>
      ) : null}

      {Object.values(terminalsMap).map(terminal => (
        <TerminalPane key={terminal.id} terminal={terminal} />
      ))}
    </S.BottomPaneManagerContainer>
  );
};

export default React.memo(BottomPaneManager);
