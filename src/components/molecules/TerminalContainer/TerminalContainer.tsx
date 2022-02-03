import {ipcRenderer} from 'electron';

import {useCallback, useEffect, useRef} from 'react';

import styled from 'styled-components';
import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {useAppSelector} from '@redux/hooks';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

const term = new Terminal({convertEol: true, fontSize: 12, rendererType: 'canvas', cols: 100, rows: 100});
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);

interface IProps {
  height: number;
  width: number;
}

const StyledTerminalContainer = styled.div<{$height: number; $width: number}>`
  ${({$height, $width}) => `
  width: ${$width}px;
  height: ${$height}px;
`}

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-top: auto;

  & .xterm-viewport {
    width: auto !important;
    overflow-y: auto;
    ${GlobalScrollbarStyle}
  }
`;

const TerminalContainer: React.FC<IProps> = props => {
  const {height, width} = props;

  const terminalContainerRef = useRef<HTMLDivElement>(null);

  const fileMap = useAppSelector(state => state.main.fileMap);
  const webContentsId = useAppSelector(state => state.main.webContentsId);

  const onIncomingData = useCallback((_, data) => {
    term.write(data);
  }, []);

  useEffect(() => {
    if (terminalContainerRef.current) {
      term.open(terminalContainerRef.current);
      terminalContainerRef.current.focus();
    }
  }, [terminalContainerRef]);

  useEffect(() => {
    term.onData(data => {
      ipcRenderer.send('terminal.ptyProcessWriteData', {data, webContentsId});
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fitAddon.fit();
  }, [height, width]);

  useEffect(() => {
    ipcRenderer.on('terminal.incomingData', onIncomingData);

    return () => {
      ipcRenderer.removeListener('terminal.incomingData', onIncomingData);
    };
  }, [onIncomingData]);

  useEffect(() => {
    const rootFolder = fileMap[ROOT_FILE_ENTRY].filePath;

    ipcRenderer.send('init-terminal', {rootFolder, webContentsId});
  }, [fileMap, webContentsId]);

  return <StyledTerminalContainer $height={height} $width={width} ref={terminalContainerRef} id="terminal-container" />;
};

export default TerminalContainer;
