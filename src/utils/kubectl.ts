import {ipcRenderer} from 'electron';

import {ensureRendererThread} from '@utils/thread';

export type KubectlOptions = {
  kubectlArgs: string[];
  kubeconfig?: string;
  yaml?: string;
};

export type SpawnResult = {
  exitCode: null | number;
  signal: null | string;
  stderr?: string;
  stdout?: string;
  error?: string;
};

export function runKubectlInMainThread(spawnArgs: string[], kubeconfig?: string, yaml?: string) {
  ensureRendererThread();
  return new Promise<SpawnResult>(resolve => {
    ipcRenderer.once('kubectl-result', (event, arg: SpawnResult) => {
      resolve(arg);
    });
    ipcRenderer.send('run-kubectl', {kubectlArgs: spawnArgs, kubeconfig, yaml} as KubectlOptions);
  });
}
