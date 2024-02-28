import {v4 as uuid} from 'uuid';

import {ErrorWithCause} from '@utils/error';
import {invokeIpc} from '@utils/ipc';

import type {DebugProxyArgs, DebugProxyResponse, SetupParams, SetupResult} from '@shared/ipc';
import {ModernKubeConfig} from '@shared/models/config';
import {runCommandInMainThread} from '@shared/utils/commands';

/**
 * These are RPC methods to administrate our kubectl interaction.
 */
export const setup = invokeIpc<SetupParams, SetupResult>('cluster:setup');
export const debugProxy = invokeIpc<DebugProxyArgs, DebugProxyResponse>('cluster:debug-proxy');
export const getProxyPort = invokeIpc<string, number | undefined>('cluster:get-proxy-port');
export const getKubeconfig = invokeIpc<{path: string | undefined}, ModernKubeConfig>('kubeconfig:get');
export const getEnvKubeconfigs = invokeIpc<undefined, string[]>('kubeconfig:get:env');
export const watchKubeconfig = invokeIpc<{kubeconfigs: string[]}, void>('kubeconfig:watch');
export const stopWatchKubeconfig = invokeIpc<undefined, void>('kubeconfig:watch:stop');

type KubectlGlobal = {
  kubeconfig?: string;
  context?: string;
};

export const KUBECTL = {
  async updateContext(context: string, globals: KubectlGlobal = {}) {
    try {
      const globalArgs = createGlobalArgs(globals);
      const arg = await runCommandInMainThread({
        commandId: uuid(),
        cmd: `kubectl`,
        args: [...globalArgs, 'config', 'use-context', context],
      });

      if (arg.exitCode !== 0) {
        throw new Error(arg.stderr);
      }
    } catch (err) {
      throw new ErrorWithCause('Error changing cluster context', err);
    }
  },
};

function createGlobalArgs(globals: KubectlGlobal) {
  const globalArgs = [];
  if (globals.kubeconfig) globalArgs.push(`--kubeconfig=${JSON.stringify(globals.kubeconfig)}`);
  if (globals.context) globalArgs.push(`--context=${JSON.stringify(globals.context)}`);
  return globalArgs;
}
