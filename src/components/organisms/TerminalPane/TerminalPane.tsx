import {ipcRenderer} from 'electron';

import React, {useCallback, useEffect, useMemo, useRef} from 'react';

import {IDisposable, Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {removeTerminal, setRunningTerminal} from '@redux/reducers/terminal';

import {useWindowSize} from '@utils/hooks';

import {TerminalType} from '@monokle-desktop/shared/models';

import * as S from './TerminalPane.styled';

interface IProps {
  height: number;
  terminal: TerminalType;
  terminalToKill: string;
}

const TerminalPane: React.FC<IProps> = props => {
  const {
    terminal: {defaultCommand, id: terminalId, shell},
  } = props;
  const {height, terminalToKill} = props;

  const dispatch = useAppDispatch();
  const bottomPaneHeight = useAppSelector(state => state.ui.paneConfiguration.bottomPaneHeight);
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const selectedTerminal = useAppSelector(state => state.terminal.selectedTerminal);
  const settings = useAppSelector(state => state.terminal.settings);
  const terminalsMap = useAppSelector(state => state.terminal.terminalsMap);
  const webContentsId = useAppSelector(state => state.terminal.webContentsId);

  const {height: windowHeight, width: windowWidth} = useWindowSize();

  const terminalRef = useRef<Terminal>();
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const terminalDataRef = useRef<IDisposable>();
  const incomingDataRef = useRef((_: any, data: string | Uint8Array) => {
    terminalRef.current?.write(data);
  });
  const terminalResizeRef = useRef<IDisposable>();
  const addonRef = useRef<FitAddon>();

  const rootFilePath = useMemo(() => fileMap[ROOT_FILE_ENTRY]?.filePath, [fileMap]);

  const killTerminal = useCallback(() => {
    addonRef.current?.dispose();
    addonRef.current = undefined;
    terminalRef.current?.clear();
    terminalRef.current?.dispose();
    terminalRef.current = undefined;
    terminalDataRef.current?.dispose();
    terminalResizeRef.current?.dispose();
    ipcRenderer.removeListener(`shell.incomingData.${terminalId}`, incomingDataRef.current);

    dispatch(removeTerminal(terminalId));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    terminalRef.current = new Terminal({cursorBlink: true, fontSize: settings.fontSize});
    addonRef.current = new FitAddon();
    terminalRef.current.loadAddon(addonRef.current);
    ipcRenderer.send('shell.init', {rootFilePath, shell, terminalId, webContentsId});

    terminalRef.current.open(terminalContainerRef.current);

    ipcRenderer.on(`shell.incomingData.${terminalId}`, incomingDataRef.current);
    ipcRenderer.on(`shell.exit.${terminalId}`, killTerminal);

    terminalResizeRef.current = terminalRef.current.onResize(({cols, rows}) => {
      ipcRenderer.send('shell.resize', {cols, rows, terminalId});
    });

    terminalDataRef.current = terminalRef.current.onData(data => {
      ipcRenderer.send('shell.ptyProcessWriteData', {data, terminalId});
    });

    ipcRenderer.on(`shell.initialized.${terminalId}`, () => {
      if (defaultCommand) {
        setTimeout(() => {
          ipcRenderer.send('shell.ptyProcessWriteData', {data: `${defaultCommand}\r`, terminalId});
        }, 200);
      }
    });

    setTimeout(() => {
      addonRef.current?.fit();
      terminalRef.current?.focus();
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
      terminalRef.current?.focus();
    }, 250);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bottomPaneHeight, bottomSelection, selectedTerminal, windowHeight, windowWidth]);

  useEffect(() => {
    if (terminalToKill !== terminalId) {
      return;
    }

    ipcRenderer.send('shell.ptyProcessKill', {terminalId});
  }, [terminalId, terminalToKill]);

  useEffect(() => {
    if (!terminalRef.current || terminalRef.current.options.fontSize === settings.fontSize) {
      return;
    }

    terminalRef.current.options.fontSize = settings.fontSize;

    setTimeout(() => {
      addonRef.current?.fit();
    }, 250);
  }, [settings.fontSize]);

  return (
    <S.TerminalPaneContainer $height={height} style={{display: selectedTerminal === terminalId ? 'block' : 'none'}}>
      <S.TerminalContainer ref={terminalContainerRef} $height={height - 14} />
    </S.TerminalPaneContainer>
  );
};

export default React.memo(TerminalPane);
