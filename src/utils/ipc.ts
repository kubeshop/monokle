import {ipcRenderer} from 'electron';

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
  return async (params: Params): Promise<Result> => {
    try {
      const result: IpcResult = await ipcRenderer.invoke(channel, params);
      if (!result.success) throw new Error(result.reason);
      return result.payload;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'error_unknown';
      throw new Error(msg);
    }
  };
}
