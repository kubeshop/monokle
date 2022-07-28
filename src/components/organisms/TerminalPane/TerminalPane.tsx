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

import {useWindowSize} from '@utils/hooks';

import * as S from './TerminalPane.styled';

interface IProps {
  terminalId: string;
}

const TerminalPane: React.FC<IProps> = props => {
  const {terminalId} = props;

  const dispatch = useAppDispatch();
  const bottomPaneHeight = useAppSelector(state => state.ui.paneConfiguration.bottomPaneHeight);
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const selectedTerminal = useAppSelector(state => state.terminal.selectedTerminal);
  const terminalsMap = useAppSelector(state => state.terminal.terminalsMap);
  const webContentsId = useAppSelector(state => state.terminal.webContentsId);

  const {height: windowHeight, width: windowWidth} = useWindowSize();

  const [containerRef, {height}] = useMeasure<HTMLDivElement>();
  const [titleBarRef, {height: titleBarHeight}] = useMeasure<HTMLDivElement>();

  const terminalRef = useRef<Terminal>();
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const terminalDataRef = useRef<IDisposable>();
  const incomingDataRef = useRef((_: any, data: string | Uint8Array) => {
    terminalRef.current?.write(data);
  });
  const terminalResizeRef = useRef<IDisposable>();
  const addonRef = useRef<FitAddon>();

  const rootFilePath = useMemo(() => fileMap[ROOT_FILE_ENTRY]?.filePath, [fileMap]);

  const onKillTerminalHandler = () => {
    if (!selectedTerminal || selectedTerminal !== terminalId) {
      return;
    }

    dispatch(setLeftBottomMenuSelection(null));

    addonRef.current?.dispose();
    addonRef.current = undefined;
    terminalRef.current?.clear();
    terminalRef.current?.dispose();
    terminalRef.current = undefined;
    terminalDataRef.current?.dispose();
    terminalResizeRef.current?.dispose();
    ipcRenderer.removeListener(`shell.incomingData.${terminalId}`, incomingDataRef.current);

    ipcRenderer.send('shell.ptyProcessKill', {terminalId});

    // if there is only one running terminal
    if (Object.keys(terminalsMap).length === 1) {
      dispatch(setSelectedTerminal(undefined));
    }

    dispatch(removeTerminal(terminalId));
  };

  const onAddTerminalHandler = () => {
    const newTerminalId = uuidv4();
    dispatch(addTerminal(newTerminalId));
    dispatch(setSelectedTerminal(newTerminalId));
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
      terminalsMap[terminalId]?.isRunning
    ) {
      return;
    }

    terminalRef.current = new Terminal({cursorBlink: true, fontSize: 12});
    addonRef.current = new FitAddon();
    terminalRef.current.loadAddon(addonRef.current);
    ipcRenderer.send('shell.init', {rootFilePath, terminalId, webContentsId});

    terminalRef.current.open(terminalContainerRef.current);
    terminalRef.current.focus();

    ipcRenderer.on(`shell.incomingData.${terminalId}`, incomingDataRef.current);

    terminalResizeRef.current = terminalRef.current.onResize(({cols, rows}) => {
      ipcRenderer.send('shell.resize', {cols, rows, terminalId});
    });

    terminalDataRef.current = terminalRef.current.onData(data => {
      ipcRenderer.send('shell.ptyProcessWriteData', {data, terminalId});
    });

    setTimeout(() => {
      addonRef.current?.fit();
    }, 250);

    dispatch(setRunningTerminal(terminalId));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bottomSelection, rootFilePath, webContentsId]);

  useEffect(() => {
    if (bottomSelection !== 'terminal' || selectedTerminal !== terminalId) {
      return;
    }

    setTimeout(() => {
      addonRef.current?.fit();
    }, 250);

    terminalRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bottomPaneHeight, bottomSelection, selectedTerminal, windowHeight, windowWidth]);

  return (
    <S.TerminalPaneContainer ref={containerRef} style={{display: selectedTerminal === terminalId ? 'block' : 'none'}}>
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

      <S.TerminalContainer
        ref={terminalContainerRef}
        $height={height - titleBarHeight - (Object.keys(terminalsMap).length > 1 ? 44 : 0)}
      />
    </S.TerminalPaneContainer>
  );
};

export default React.memo(TerminalPane);
