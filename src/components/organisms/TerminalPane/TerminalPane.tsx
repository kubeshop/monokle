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

const xterm = new Terminal({cursorBlink: true, fontSize: 12});
const fitAddon = new FitAddon();

const TerminalPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const webContentsId = useAppSelector(state => state.main.webContentsId);

  const [containerRef, {height, width}] = useMeasure<HTMLDivElement>();
  const terminalContainerRef = useRef<HTMLDivElement>(null);

  const rootFilePath = useMemo(() => fileMap[ROOT_FILE_ENTRY]?.filePath, [fileMap]);
  const fitLazy = useRef(() => {});

  useEffect(() => {
    if (!terminalContainerRef.current || terminalContainerRef.current.childElementCount !== 0) {
      return;
    }

    xterm.loadAddon(fitAddon);
    xterm.open(terminalContainerRef.current);
    terminalContainerRef.current.focus();
    fitLazy.current = debounce(() => fitAddon.fit(), 250);

    xterm.onResize(({cols, rows}) => {
      ipcRenderer.send('resize-shell', {cols, rows, webContentsId});
    });

    fitAddon.fit();

    return () => {
      xterm.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!rootFilePath) {
      return;
    }

    ipcRenderer.send('init-shell', {rootFilePath, webContentsId});
  }, [rootFilePath, webContentsId]);

  useEffect(() => {
    fitLazy.current();
    terminalContainerRef.current?.focus();
  }, [height, webContentsId, width]);

  return (
    <S.TerminalPaneContainer ref={containerRef}>
      <S.TitleBar>
        <S.TitleLabel>
          <Icon name="terminal" />
          <MonoPaneTitle style={{paddingLeft: '10px'}}>Terminal</MonoPaneTitle>
        </S.TitleLabel>

        <S.DownCircleFilled onClick={() => dispatch(setLeftBottomMenuSelection(null))} />
      </S.TitleBar>

      <S.TerminalContainer ref={terminalContainerRef} />
    </S.TerminalPaneContainer>
  );
};

export default TerminalPane;
