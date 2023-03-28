import {ipcRenderer} from 'electron';

import {v4 as uuid} from 'uuid';

import {ClusterProxyOptions} from '@shared/models/cluster';
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

export function openKubectlProxy(
  listener: (...args: any[]) => void,
  clusterProxyOptions: ClusterProxyOptions
): Promise<number> {
  ipcRenderer.removeAllListeners('kubectl-proxy-event');
  ipcRenderer.on('kubectl-proxy-event', (event, args) => listener(args));
  return ipcRenderer.invoke('kubectl-proxy-open', clusterProxyOptions);
}

export function closeKubectlProxy() {
  ipcRenderer.send('kubectl-proxy-close');
}
