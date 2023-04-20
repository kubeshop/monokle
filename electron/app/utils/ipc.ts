import {ipcMain} from 'electron';

import log from 'loglevel';

import {IpcResult} from '@shared/ipc';

export type RendererMetadata = {
  rendererId: number;
};

export async function handleIpc<Params, Result>(
  channel: string,
  handler: (params: Params, metadata: RendererMetadata) => Result,
  debug = false
) {
  ipcMain.handle(channel, async (event, params: Params): Promise<IpcResult> => {
    try {
      event.processId;
      const payload = await handler(params, {rendererId: event.processId});
      return {success: true, payload};
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'error_unknown';
      if (debug) log.error('ipc_failed', msg);
      return {success: false, reason: msg};
    }
  });
}
