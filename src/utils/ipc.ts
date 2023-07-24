import {ipcRenderer} from 'electron';

import log from 'loglevel';

import type {IpcResult} from '@shared/ipc';
import {StartupFlags} from '@shared/models/startupFlag';

import {StartupFlag} from './startupFlag';

export function getChannelName(name: string, hasAutomationFlag = StartupFlag.getInstance().hasAutomationFlag) {
  if (hasAutomationFlag) {
    return `${name}-${StartupFlags.AUTOMATION}`;
  }

  return name;
}

export function invokeIpc<Params, Result>(channel: string) {
  log.debug('invokeIpc:call', channel);
  return async (...params: Params extends undefined ? [undefined?] : [Params]): Promise<Result> => {
    try {
      const result: IpcResult = await ipcRenderer.invoke(channel, params[0]);
      if (!result.success) {
        log.debug('invokeIpc:error', channel, result.reason);
        throw new Error(result.reason);
      }
      log.debug('invokeIpc:success', channel, result.payload);
      return result.payload;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'error_unknown';
      log.debug('invokeIpc:error', channel, msg);
      throw new Error(msg);
    }
  };
}
