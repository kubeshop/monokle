import {ipcRenderer} from 'electron';

import {getPort} from 'get-port-please';
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

export async function openKubectlProxy() {
  const port = await getPort();

  ipcRenderer.send('kubectl-proxy-open', {port});

  return {port};
}

export function closeKubectlProxy() {
  ipcRenderer.send('kubectl-proxy-close');
}

export async function listenKubectlProxyEvents(listener: (...args: any[]) => void) {
  ipcRenderer.on('kubectl-proxy-event', listener);
}
