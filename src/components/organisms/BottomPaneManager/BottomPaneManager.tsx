import React, {useCallback, useEffect, useState} from 'react';
import {useMeasure} from 'react-use';

import {Dropdown, Popconfirm, Tooltip} from 'antd';

import {v4 as uuidv4} from 'uuid';

import {TOOLTIP_DELAY} from '@constants/constants';
import {AddTerminalTooltip, KillTerminalTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {addTerminal, setSelectedTerminal} from '@redux/reducers/terminal';
import {setLeftBottomMenuSelection} from '@redux/reducers/ui';
import {setTerminalShells} from '@redux/services/terminalShells';

import {PreviewSavedCommand, SaveCommand} from '@components/molecules/CommandPreview';

import {useNewTerminalMenuItems, useTerminalOptionsMenuItems} from '@hooks/menuItemsHooks';

import {Icon} from '@monokle/components';
import {TerminalType} from '@shared/models/terminal';

import TerminalPane from '../TerminalPane';
import * as S from './BottomPaneManager.styled';

const BottomPaneManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const isLeftMenuActive = useAppSelector(state => state.ui.leftMenu.isActive);
  const osPlatform = useAppSelector(state => state.config.osPlatform);
  const selectedTerminal = useAppSelector(state => state.terminal.selectedTerminal);
  const settings = useAppSelector(state => state.terminal.settings);
  const shellsMap = useAppSelector(state => state.terminal.shellsMap);
  const terminalsMap = useAppSelector(state => state.terminal.terminalsMap);

  const [terminalToKill, setTerminalToKill] = useState<string>('');

  const [bottomPaneManagerRef, {height}] = useMeasure<HTMLDivElement>();
  const [tabsContainerRef, {height: tabsContainerHeight}] = useMeasure<HTMLDivElement>();

  const {items: newTerminalMenuItems, onClick: onAddNewTerminalHandler} = useNewTerminalMenuItems();
  const terminalOptionsMenuItems = useTerminalOptionsMenuItems();

  const onAddTerminalHandler = () => {
    const newTerminalId = uuidv4();

    dispatch(setSelectedTerminal(newTerminalId));
    dispatch(addTerminal({id: newTerminalId, isRunning: false, shell: settings.defaultShell}));
  };

  const renderTerminalName = useCallback((terminal: TerminalType, index: number) => {
    let name = '';

    if (terminal.pod) {
      name += terminal.pod.name;
    } else {
      name += 'Terminal';

      if (index) {
        name += ` (${index + 1})`;
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
    dispatch(addTerminal({id: newTerminalId, isRunning: false, shell: settings.defaultShell}));
    dispatch(setSelectedTerminal(newTerminalId));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bottomSelection, selectedTerminal, shellsMap]);

  useEffect(() => {
    if (Object.keys(shellsMap).length) {
      return;
    }

    setTerminalShells(osPlatform, settings, dispatch);
  }, [dispatch, osPlatform, settings, shellsMap]);

  return (
    <S.BottomPaneManagerContainer ref={bottomPaneManagerRef} $isLeftMenuActive={isLeftMenuActive}>
      <S.TabsContainer ref={tabsContainerRef}>
        <S.Tabs $count={Object.keys(terminalsMap).length}>
          {Object.values(terminalsMap).map((terminal, index) => (
            <S.Tab
              key={terminal.id}
              $selected={selectedTerminal === terminal.id}
              onClick={() => dispatch(setSelectedTerminal(terminal.id))}
            >
              <Icon name="terminal" />

              {renderTerminalName(terminal, index)}

              <Tooltip mouseEnterDelay={TOOLTIP_DELAY} placement="bottom" title={KillTerminalTooltip}>
                <Popconfirm
                  placement="top"
                  title={`Are you sure you want to kill ${
                    terminal.pod ? `${terminal.pod.name} terminal` : `Terminal ${index ? `(${index + 1})` : ''}`
                  }?`}
                  okText="Yes"
                  onConfirm={e => {
                    e?.stopPropagation();
                    setTerminalToKill(terminal.id);
                  }}
                  onCancel={e => {
                    e?.stopPropagation();
                  }}
                >
                  <S.CloseOutlined
                    onClick={e => {
                      e.stopPropagation();
                    }}
                  />
                </Popconfirm>
              </Tooltip>
            </S.Tab>
          ))}

          <S.NewTabActions>
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={AddTerminalTooltip}>
              <S.PlusCircleFilled onClick={onAddTerminalHandler} />
            </Tooltip>

            <Dropdown
              menu={{items: newTerminalMenuItems, onClick: menuItem => onAddNewTerminalHandler(menuItem.key)}}
              placement="bottomLeft"
              trigger={['click']}
            >
              <S.DownOutlined />
            </Dropdown>
          </S.NewTabActions>
        </S.Tabs>

        <S.TabsActions>
          <SaveCommand />

          <PreviewSavedCommand />

          <Dropdown
            mouseEnterDelay={0.5}
            placement="bottomRight"
            menu={{items: terminalOptionsMenuItems, className: 'terminal-options-menu'}}
          >
            <S.EllipsisOutlined />
          </Dropdown>

          <S.CaretDownFilled onClick={() => dispatch(setLeftBottomMenuSelection(undefined))} />
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
