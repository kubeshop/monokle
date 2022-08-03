import React, {useCallback, useEffect, useState} from 'react';
import {useMeasure} from 'react-use';

import {Dropdown, Tooltip} from 'antd';

import {v4 as uuidv4} from 'uuid';

import {TOOLTIP_DELAY} from '@constants/constants';
import {AddTerminalTooltip, KillTerminalTooltip} from '@constants/tooltips';

import {TerminalType} from '@models/terminal';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {addTerminal, setSelectedTerminal} from '@redux/reducers/terminal';
import {setLeftBottomMenuSelection} from '@redux/reducers/ui';

import {Icon} from '@atoms';

import TerminalPane from '../TerminalPane';
import TerminalOptions from '../TerminalPane/TerminalOptions';
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

  const renderTerminalName = useCallback((terminal: TerminalType, index: number) => {
    let name = '';

    if (terminal.pod) {
      name += terminal.pod.name;
    } else {
      name += 'Terminal';

      if (index) {
        name += ` ${index + 1}`;
      }
    }

    return (
      <S.TabName>
        {name} {terminal.pod?.namespace ? <S.PodNamespaceLabel>{terminal.pod.namespace}</S.PodNamespaceLabel> : null}
      </S.TabName>
    );
  }, []);

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
          {Object.values(terminalsMap).map((terminal, index) => (
            <S.Tab
              key={terminal.id}
              $selected={selectedTerminal === terminal.id}
              onClick={() => dispatch(setSelectedTerminal(terminal.id))}
            >
              <Icon name="terminal" />

              {renderTerminalName(terminal, index)}

              <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={KillTerminalTooltip}>
                <S.CloseOutlined onClick={() => setTerminalToKill(terminal.id)} />
              </Tooltip>
            </S.Tab>
          ))}

          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={AddTerminalTooltip}>
            <S.PlusCircleFilled onClick={onAddTerminalHandler} />
          </Tooltip>
        </S.Tabs>

        <S.TabsActions>
          <Dropdown mouseEnterDelay={0.5} placement="bottomRight" overlay={<TerminalOptions />}>
            <S.EllipsisOutlined />
          </Dropdown>

          <S.CaretDownFilled onClick={() => dispatch(setLeftBottomMenuSelection(null))} />
        </S.TabsActions>
      </S.TabsContainer>

      {Object.values(terminalsMap).map(terminal => (
        <TerminalPane
          key={terminal.id}
          height={height - tabsContainerHeight}
          terminal={terminal}
          terminalToKill={terminalToKill}
        />
      ))}
    </S.BottomPaneManagerContainer>
  );
};

export default React.memo(BottomPaneManager);
