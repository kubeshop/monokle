/* eslint-disable import/order */
import {Page, _electron as electron} from 'playwright';

import {findLatestBuild, parseElectronApp} from './helpers';
import {ElectronApplication, expect, test} from '@playwright/test';

let electronApp: ElectronApplication;
let appWindow: Page;

test.beforeAll(async () => {
  // find the latest build in the out directory
  const latestBuild = findLatestBuild();
  // parse the directory and find paths and other info
  const appInfo = parseElectronApp(latestBuild);
  electronApp = await electron.launch({
    args: [appInfo.main],
    executablePath: appInfo.executable,
  });

  // wait for splash-screen to pass
  await electronApp.firstWindow();
  while (electronApp.windows().length === 2) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise(f => setTimeout(f, 100));
  }

  const windows = electronApp.windows();
  expect(windows.length).toBe(1);
  appWindow = windows[0];
});

test('Validate main page', async () => {
  await appWindow.waitForSelector('footer');
  const footer = await appWindow.$eval('footer', el => el.textContent);
  expect(footer).toBe('Monokle 1.4.0 - kubeshop.io 2021');

  const title = await appWindow.title();
  expect(title).toBe('Monokle');

  await electronApp.close();
});
