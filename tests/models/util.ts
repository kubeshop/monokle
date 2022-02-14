import {ElectronApplication} from 'playwright-core';

export async function mockHandle(electronApp: ElectronApplication, channel: string, name: string) {
  await electronApp.evaluate(({ ipcMain }, params) => {
    ipcMain.handle(params.channel, () => {
      return [params.name];
    });
  }, { channel, name });
}
