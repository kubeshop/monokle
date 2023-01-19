import {ipcRenderer} from 'electron';

import {useEffect, useRef} from 'react';

import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';

import {K8sResource} from '@models/k8sresource';

import {useAppSelector} from '@redux/hooks';

import * as S from './TerminalTab.styled';

export const TerminalTab = ({resourceId}: {resourceId: string}) => {
  const previewKubeConfigPath = useAppSelector(state => state.main.previewKubeConfigPath);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal>();
  const webContentsId = useAppSelector(state => state.terminal.webContentsId);

  const addonRef = useRef<FitAddon>();
  const resource: K8sResource = useAppSelector(state => state.main.resourceMap[resourceId]);
  useEffect(() => {
    if (webContentsId && resource && previewKubeConfigPath) {
      ipcRenderer.send('pod.terminal.init', {
        previewKubeConfigPath,
        podNamespace: resource.namespace,
        podName: resource.name,
        containerName: resource.content.spec.containers[0].name,
        webContentsId,
      });
    }

    return () => {
      ipcRenderer.send('pod.terminal.close');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewKubeConfigPath, resource, webContentsId]);

  useEffect(() => {
    if (!terminalContainerRef.current || terminalContainerRef.current.childElementCount !== 0) {
      return;
    }

    terminalRef.current = new Terminal({cursorBlink: true, fontSize: 12});
    addonRef.current = new FitAddon();
    terminalRef.current.loadAddon(addonRef.current);

    let command: Array<string> = [];
    terminalRef.current.onKey(e => {
      if (terminalRef.current) {
        terminalRef.current.write(e.key);
        command.push(e.key);
        if (e.domEvent.key === 'Enter') {
          ipcRenderer.send('pod.terminal.command', command.join(''));
          command = [];
        }

        if (e.domEvent.key === 'Backspace') {
          terminalRef.current.write('\b \b');
          command.pop();
        }
      }
    });
    terminalRef.current.open(terminalContainerRef.current);
    ipcRenderer.on('pod.terminal.output', (_event, output) => {
      if (terminalRef && terminalRef.current) {
        terminalRef.current.write(output);
      }
    });
  }, []);
  return (
    <S.TerminalPaneContainer>
      <S.TerminalContainer ref={terminalContainerRef} />
    </S.TerminalPaneContainer>
  );
};
