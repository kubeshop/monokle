import {ipcRenderer} from 'electron';

import {v4 as uuid} from 'uuid';

import {CommandOptions, KubectlApplyArgs, KubectlEnv} from '@shared/models/commands';

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

export function openKubectlProxy(listener: (...args: any[]) => void) {
  ipcRenderer.removeAllListeners('kubectl-proxy-event');
  ipcRenderer.on('kubectl-proxy-event', (event, args) => listener(args));
  ipcRenderer.send('kubectl-proxy-open');
}

export function closeKubectlProxy() {
  ipcRenderer.send('kubectl-proxy-close');
}
