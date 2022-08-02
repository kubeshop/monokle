import React, {useEffect, useState} from 'react';
import {useMeasure} from 'react-use';

import {Tooltip} from 'antd';

import {v4 as uuidv4} from 'uuid';

import {TOOLTIP_DELAY} from '@constants/constants';
import {AddTerminalTooltip, KillTerminalTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {addTerminal, setSelectedTerminal} from '@redux/reducers/terminal';

import {Icon} from '@atoms';

import TerminalPane from '../TerminalPane';
import * as S from './BottomPaneManager.styled';

const BottomPaneManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const selectedTerminal = useAppSelector(state => state.terminal.selectedTerminal);
  const terminalsMap = useAppSelector(state => state.terminal.terminalsMap);

  const [terminalToKill, setTerminalToKill] = useState<string>('');

  const [bottomPaneManagerRef, {height}] = useMeasure<HTMLDivElement>();
  const [tabsContainerRef, {height: tabsContainerHeight}] = useMeasure<HTMLDivElement>();

  const onAddTerminalHandler = () => {
    const newTerminalId = uuidv4();

    dispatch(setSelectedTerminal(newTerminalId));
    dispatch(addTerminal({id: newTerminalId, isRunning: false}));
  };

  const onKillTerminalHandler = (terminalId: string) => {
    setTerminalToKill(terminalId);
  };

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
    <S.BottomPaneManagerContainer ref={bottomPaneManagerRef}>
      <S.TabsContainer ref={tabsContainerRef}>
        <S.Tabs>
          {Object.keys(terminalsMap).map((id, index) => (
            <S.Tab key={id} $selected={selectedTerminal === id} onClick={() => dispatch(setSelectedTerminal(id))}>
              <Icon name="terminal" />
              Terminal {index ? index + 1 : ''}
              <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={KillTerminalTooltip}>
                <S.CloseOutlined onClick={() => onKillTerminalHandler(id)} />
              </Tooltip>
            </S.Tab>
          ))}

          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={AddTerminalTooltip}>
            <S.PlusCircleFilled onClick={onAddTerminalHandler} />
          </Tooltip>
        </S.Tabs>
      </S.TabsContainer>

      {Object.values(terminalsMap).map(terminal => (
        <TerminalPane
          key={terminal.id}
          height={height - tabsContainerHeight}
          terminal={terminal}
          terminalToKill={terminalToKill}
          onTerminalKilled={() => setTerminalToKill('')}
        />
      ))}
    </S.BottomPaneManagerContainer>
  );
};

export default React.memo(BottomPaneManager);
