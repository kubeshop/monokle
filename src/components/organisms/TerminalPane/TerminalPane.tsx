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
import {addRunningTerminal, removeRunningTerminal} from '@redux/reducers/terminal';
import {setLeftBottomMenuSelection} from '@redux/reducers/ui';

import {Icon, MonoPaneTitle} from '@atoms';

import * as S from './TerminalPane.styled';

let terminalId = '';
const fitAddon = new FitAddon();

const TerminalPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const bottomPaneHeight = useAppSelector(state => state.ui.paneConfiguration.bottomPaneHeight);
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const runningTerminals = useAppSelector(state => state.terminal.runningTerminals);
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
    dispatch(setLeftBottomMenuSelection(null));

    terminalRef.current?.clear();
    terminalRef.current?.dispose();
    terminalRef.current = undefined;
    terminalDataRef.current?.dispose();
    terminalResizeRef.current?.dispose();
    ipcRenderer.removeListener('shell.incomingData', incomingDataRef.current);

    ipcRenderer.send('shell.ptyProcessKill', {webContentsId});

    dispatch(removeRunningTerminal(terminalId));
    terminalId = '';
  };

  const onAddTerminalHandler = () => {};

  useEffect(() => {
    if (
      !bottomSelection ||
      bottomSelection !== 'terminal' ||
      !rootFilePath ||
      !webContentsId ||
      !terminalContainerRef.current ||
      terminalContainerRef.current.childElementCount !== 0 ||
      (runningTerminals.length && runningTerminals.includes(terminalId))
    ) {
      return;
    }

    terminalRef.current = new Terminal({cursorBlink: true, fontSize: 12});
    terminalRef.current.loadAddon(fitAddon);
    ipcRenderer.send('shell.init', {rootFilePath, webContentsId});

    terminalId = uuidv4();
    terminalRef.current.open(terminalContainerRef.current);
    terminalRef.current.focus();

    ipcRenderer.on('shell.incomingData', incomingDataRef.current);

    terminalResizeRef.current = terminalRef.current.onResize(({cols, rows}) => {
      ipcRenderer.send('shell.resize', {cols, rows, webContentsId});
    });

    terminalDataRef.current = terminalRef.current.onData(data => {
      ipcRenderer.send('shell.ptyProcessWriteData', {data, webContentsId});
    });

    fitAddon.fit();

    dispatch(addRunningTerminal(terminalId));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bottomSelection, rootFilePath, webContentsId]);

  useEffect(() => {
    if (bottomSelection !== 'terminal') {
      return;
    }

    setTimeout(() => {
      fitAddon.fit();
    }, 250);

    terminalRef.current?.focus();
  }, [bottomPaneHeight, bottomSelection]);

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
