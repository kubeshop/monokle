import {ipcRenderer} from 'electron';

import {useEffect, useMemo, useRef} from 'react';
import {useMeasure} from 'react-use';

import {debounce} from 'lodash';
import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLeftBottomMenuSelection} from '@redux/reducers/ui';

import {Icon, MonoPaneTitle} from '@atoms';

import * as S from './TerminalPane.styled';

const fitAddon = new FitAddon();
const fitLazy = debounce(() => fitAddon.fit(), 250);

const TerminalPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const webContentsId = useAppSelector(state => state.main.webContentsId);

  const [containerRef, {height, width}] = useMeasure<HTMLDivElement>();
  const [titleBarRef, {height: titleBarHeight}] = useMeasure<HTMLDivElement>();
  const terminalContainerRef = useRef<HTMLDivElement>(null);

  const rootFilePath = useMemo(() => fileMap[ROOT_FILE_ENTRY]?.filePath, [fileMap]);
  const terminalRef = useRef<Terminal>();

  useEffect(() => {
    if (!terminalContainerRef.current || terminalContainerRef.current.childElementCount !== 0) {
      return;
    }

    terminalRef.current = new Terminal({cursorBlink: true, fontSize: 12});
    terminalRef.current.loadAddon(fitAddon);
    terminalRef.current.open(terminalContainerRef.current);
    terminalRef.current.focus();

    const onIncomingData = (_: any, data: string | Uint8Array) => {
      terminalRef.current?.write(data);
    };

    ipcRenderer.on('shell.incomingData', onIncomingData);

    terminalRef.current.onResize(({cols, rows}) => {
      ipcRenderer.send('resize-shell', {cols, rows, webContentsId});
    });

    terminalRef.current.onData(data => {
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
  }, []);

  useEffect(() => {
    if (!rootFilePath) {
      return;
    }

    ipcRenderer.send('init-shell', {rootFilePath, webContentsId});
  }, [rootFilePath, webContentsId]);

  useEffect(() => {
    fitLazy();
    terminalRef.current?.focus();
  }, [height, webContentsId, width]);

  return (
    <S.TerminalPaneContainer ref={containerRef}>
      <S.TitleBar ref={titleBarRef}>
        <S.TitleLabel>
          <Icon name="terminal" />
          <MonoPaneTitle style={{paddingLeft: '10px'}}>Terminal</MonoPaneTitle>
        </S.TitleLabel>

        <S.DownCircleFilled onClick={() => dispatch(setLeftBottomMenuSelection(null))} />
      </S.TitleBar>

      <S.TerminalContainer ref={terminalContainerRef} $height={height - titleBarHeight} />
    </S.TerminalPaneContainer>
  );
};

export default TerminalPane;
