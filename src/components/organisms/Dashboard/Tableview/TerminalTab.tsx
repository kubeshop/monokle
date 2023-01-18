import {useEffect, useRef} from 'react';

import * as pty from 'node-pty';
import {IDisposable, Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';

import * as S from './TerminalTab.styled';

export const TerminalTab = () => {
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal>();
  const terminalDataRef = useRef<IDisposable>();
  const incomingDataRef = useRef((_: any, data: string | Uint8Array) => {
    terminalRef.current?.write(data);
  });
  const addonRef = useRef<FitAddon>();

  const terminalResizeRef = useRef<IDisposable>();

  useEffect(() => {
    if (!terminalContainerRef.current || terminalContainerRef.current.childElementCount !== 0) {
      return;
    }

    try {
      const ptyProcess = pty.spawn('sh', [], {
        name: 'xterm-256color',
        rows: 24,
        cols: 80,
        cwd: '/',
        env: process.env as Record<string, string>,
        useConpty: false,
      });

      ptyProcess.onData((incomingData: any) => {
        console.log('incomingData', incomingData);
        incomingDataRef.current = incomingData;
      });

      ptyProcess.onExit(() => {});
    } catch (error) {
      console.log(error);
    }

    terminalRef.current = new Terminal({cursorBlink: true, fontSize: 12});
    addonRef.current = new FitAddon();
    terminalRef.current.loadAddon(addonRef.current);

    terminalRef.current.open(terminalContainerRef.current);

    terminalDataRef.current = terminalRef.current.onData(data => {});
  }, []);
  return (
    <S.TerminalPaneContainer>
      <S.TerminalContainer ref={terminalContainerRef} />
    </S.TerminalPaneContainer>
  );
};
