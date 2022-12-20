import {ipcRenderer} from 'electron';

import {v4 as uuid} from 'uuid';

import {CommandOptions} from './execute';

type KubectlEnv = {
  KUBECONFIG?: string;
};

type KubectlApplyArgs = {
  context: string;
  input: string;
  namespace?: string;
};

export function createKubectlApplyCommand(
  {context, namespace, input}: KubectlApplyArgs,
  env?: KubectlEnv
): CommandOptions {
  const args = ['--context', context, 'apply', '-f', '-'];

  if (namespace) {
    args.unshift('--namespace', namespace);
  }

  return {
    commandId: uuid(),
    cmd: 'kubectl',
    args,
    input,
    env,
  };
}

export function openKubectlProxy(port: number, listener: (...args: any[]) => void) {
  ipcRenderer.on('kubectl-proxy-event', (event, args) => listener(args));
  ipcRenderer.send('kubectl-proxy-open', {port});
}

export function closeKubectlProxy() {
  ipcRenderer.send('kubectl-proxy-close');
}
