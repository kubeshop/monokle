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
export const getKubeconfig = invokeIpc<{path: string | undefined}, ModernKubeConfig>('kubeconfig:get');
export const watchKubeconfig = invokeIpc<{kubeconfigs: string[]}, void>('kubeconfig:watch');
export const stopWatchKubeconfig = invokeIpc<undefined, void>('kubeconfig:watch:stop');

export const KUBECTL = {
  async updateContext(context: string) {
    try {
      const arg = await runCommandInMainThread({
        commandId: uuid(),
        cmd: `kubectl`,
        args: ['config', 'use-context', context],
      });

      if (arg.exitCode !== 0) {
        throw new Error(arg.stderr);
      }
    } catch (err) {
      throw new ErrorWithCause('Error changing cluster context', err);
    }
  },
};
