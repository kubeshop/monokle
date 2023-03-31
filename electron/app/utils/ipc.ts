import {ipcMain} from 'electron';

import {IpcResult} from '@shared/ipc';

export async function handleIpc<Params, Result>(channel: string, handler: (params: Params) => Result) {
  ipcMain.handle(channel, async (_, params: Params): Promise<IpcResult> => {
    try {
      const payload = await handler(params);
      return {success: true, payload};
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'error_unknown';
      return {success: false, reason: msg};
    }
  });
}
