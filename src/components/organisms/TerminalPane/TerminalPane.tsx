import {ipcRenderer} from 'electron';

import React, {useEffect, useMemo, useRef} from 'react';
import {useMeasure} from 'react-use';

import {Tooltip} from 'antd';

import {v4 as uuidv4} from 'uuid';
import {IDisposable, Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';

import {ROOT_FILE_ENTRY, TOOLTIP_DELAY} from '@constants/constants';
import {AddTerminalTooltip, KillTerminalTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {addTerminal, removeTerminal, setRunningTerminal, setSelectedTerminal} from '@redux/reducers/terminal';
import {setLeftBottomMenuSelection} from '@redux/reducers/ui';

import {Icon, MonoPaneTitle} from '@atoms';

import * as S from './TerminalPane.styled';

const fitAddon = new FitAddon();

const TerminalPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const bottomPaneHeight = useAppSelector(state => state.ui.paneConfiguration.bottomPaneHeight);
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const selectedTerminal = useAppSelector(state => state.terminal.selectedTerminal);
  const terminalsMap = useAppSelector(state => state.terminal.terminalsMap);
  const webContentsId = useAppSelector(state => state.terminal.webContentsId);

  const [containerRef, {height}] = useMeasure<HTMLDivElement>();
  const [titleBarRef, {height: titleBarHeight}] = useMeasure<HTMLDivElement>();

  const terminalRef = useRef<Terminal>();
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const terminalDataRef = useRef<IDisposable>();
  const incomingDataRef = useRef((_: any, data: string | Uint8Array) => {
    terminalRef.current?.write(data);
  });
  const terminalResizeRef = useRef<IDisposable>();

  const rootFilePath = useMemo(() => fileMap[ROOT_FILE_ENTRY]?.filePath, [fileMap]);

  const onKillTerminalHandler = () => {
    if (!selectedTerminal) {
      return;
    }

    dispatch(setLeftBottomMenuSelection(null));

    terminalRef.current?.clear();
    terminalRef.current?.dispose();
    terminalRef.current = undefined;
    terminalDataRef.current?.dispose();
    terminalResizeRef.current?.dispose();
    ipcRenderer.removeListener('shell.incomingData', incomingDataRef.current);

    ipcRenderer.send('shell.ptyProcessKill', {terminalId: selectedTerminal});

    // if there is only one running terminal
    if (Object.keys(terminalsMap).length === 1) {
      dispatch(setSelectedTerminal(undefined));
    }

    dispatch(removeTerminal(selectedTerminal));
  };

  const onAddTerminalHandler = () => {
    // const newTerminalId = uuidv4();
    // dispatch(setSelectedTerminal(newTerminalId));
  };

  useEffect(() => {
    if (
      !bottomSelection ||
      bottomSelection !== 'terminal' ||
      !rootFilePath ||
      !webContentsId ||
      !selectedTerminal ||
      !terminalContainerRef.current ||
      terminalContainerRef.current.childElementCount !== 0 ||
      terminalsMap[selectedTerminal]?.isRunning
    ) {
      return;
    }

    terminalRef.current = new Terminal({cursorBlink: true, fontSize: 12});
    terminalRef.current.loadAddon(fitAddon);
    ipcRenderer.send('shell.init', {rootFilePath, terminalId: selectedTerminal, webContentsId});

    terminalRef.current.open(terminalContainerRef.current);
    terminalRef.current.focus();

    ipcRenderer.on('shell.incomingData', incomingDataRef.current);

    terminalResizeRef.current = terminalRef.current.onResize(({cols, rows}) => {
      ipcRenderer.send('shell.resize', {cols, rows});
    });

    terminalDataRef.current = terminalRef.current.onData(data => {
      ipcRenderer.send('shell.ptyProcessWriteData', {data, terminalId: selectedTerminal});
    });

    fitAddon.fit();

    dispatch(setRunningTerminal(selectedTerminal));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bottomSelection, selectedTerminal, rootFilePath, webContentsId]);

  useEffect(() => {
    if (bottomSelection !== 'terminal') {
      return;
    }

    setTimeout(() => {
      fitAddon.fit();
    }, 250);

    terminalRef.current?.focus();
  }, [bottomPaneHeight, bottomSelection, selectedTerminal]);

  // treat the case where the bottom selection is set to terminal and the user opens Monokle
  useEffect(() => {
    if (selectedTerminal || bottomSelection !== 'terminal') {
      return;
    }

    const newTerminalId = uuidv4();
    dispatch(setSelectedTerminal(newTerminalId));
    dispatch(addTerminal(newTerminalId));
  }, [bottomSelection, dispatch, selectedTerminal]);

  return (
    <S.TerminalPaneContainer ref={containerRef}>
      <S.TitleBar ref={titleBarRef}>
        <S.TitleLabel>
          <Icon name="terminal" />
          <MonoPaneTitle style={{paddingLeft: '10px'}}>Terminal</MonoPaneTitle>
        </S.TitleLabel>

        <S.TerminalActions>
          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={AddTerminalTooltip}>
            <S.PlusOutlined onClick={onAddTerminalHandler} />
          </Tooltip>

          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={KillTerminalTooltip}>
            <S.DeleteOutlined onClick={onKillTerminalHandler} />
          </Tooltip>

          <S.DownCircleFilled onClick={() => dispatch(setLeftBottomMenuSelection(null))} />
        </S.TerminalActions>
      </S.TitleBar>

      <S.TerminalContainer ref={terminalContainerRef} $height={height - titleBarHeight} />
    </S.TerminalPaneContainer>
  );
};

export default React.memo(TerminalPane);
