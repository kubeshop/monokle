import {ipcRenderer} from 'electron';

import {SpawnResult} from '@utils/kubectl';
import {ensureRendererThread} from '@utils/thread';

export type HelmCommand = {
  helmCommand: string;
  kubeconfig: string;
};

/**
 * Invokes Helm in main thread
 */
export function runHelmInMainThread(cmd: HelmCommand) {
  ensureRendererThread();

  return new Promise<SpawnResult>(resolve => {
    ipcRenderer.once('helm-result', (event, arg) => {
      resolve(arg);
    });
    ipcRenderer.send('run-helm', cmd);
  });
}
