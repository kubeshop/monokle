import {ipcRenderer} from 'electron';

import React, {useEffect, useMemo, useRef} from 'react';
import {useMeasure} from 'react-use';

import {Tooltip} from 'antd';

import {IDisposable, Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';

import {ROOT_FILE_ENTRY, TOOLTIP_DELAY} from '@constants/constants';
import {KillTerminalTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLeftBottomMenuSelection} from '@redux/reducers/ui';

import {Icon, MonoPaneTitle} from '@atoms';

import * as S from './TerminalPane.styled';

const terminal = new Terminal({cursorBlink: true, fontSize: 12});
const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);

const TerminalPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const bottomPaneHeight = useAppSelector(state => state.ui.paneConfiguration.bottomPaneHeight);
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const webContentsId = useAppSelector(state => state.main.webContentsId);

  const [containerRef, {height}] = useMeasure<HTMLDivElement>();
  const [titleBarRef, {height: titleBarHeight}] = useMeasure<HTMLDivElement>();
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const terminalResizeRef = useRef<IDisposable>();

  const rootFilePath = useMemo(() => fileMap[ROOT_FILE_ENTRY]?.filePath, [fileMap]);

  const onKillTerminalHandler = () => {
    dispatch(setLeftBottomMenuSelection(null));
  };

  useEffect(() => {
    if (!webContentsId || !terminalContainerRef.current || terminalContainerRef.current.childElementCount !== 0) {
      return;
    }

    terminal.open(terminalContainerRef.current);
    terminal.focus();

    const onIncomingData = (_: any, data: string | Uint8Array) => {
      terminal.write(data);
    };

    ipcRenderer.on('shell.incomingData', onIncomingData);

    terminalResizeRef.current = terminal.onResize(({cols, rows}) => {
      ipcRenderer.send('shell.resize', {cols, rows, webContentsId});
    });

    terminal.onData(data => {
      ipcRenderer.send('shell.ptyProcessWriteData', {data, webContentsId});
    });

    fitAddon.fit();

    return () => {
      ipcRenderer.removeListener('shell.incomingData', onIncomingData);
    };

    // return () => {
    //   onResizeHandler.dispose();
    //   onDataHandler.dispose();
    //   terminalRef.current?.dispose();
    // };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webContentsId]);

  useEffect(() => {
    if (!rootFilePath || !webContentsId) {
      return;
    }

    ipcRenderer.send('shell.init', {rootFilePath, webContentsId});
  }, [rootFilePath, webContentsId]);

  useEffect(() => {
    if (bottomSelection !== 'terminal') {
      return;
    }

    setTimeout(() => {
      fitAddon.fit();
    }, 250);

    terminal.focus();
  }, [bottomPaneHeight, bottomSelection]);

  return (
    <S.TerminalPaneContainer ref={containerRef}>
      <S.TitleBar ref={titleBarRef}>
        <S.TitleLabel>
          <Icon name="terminal" />
          <MonoPaneTitle style={{paddingLeft: '10px'}}>Terminal</MonoPaneTitle>
        </S.TitleLabel>

        <S.TerminalActions>
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
