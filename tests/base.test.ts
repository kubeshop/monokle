/* eslint-disable import/order */
import {_electron as electron} from 'playwright';

import {findLatestBuild, parseElectronApp} from './helpers';
import {ElectronApplication, expect, test} from '@playwright/test';

let electronApp: ElectronApplication;

test.beforeAll(async () => {
  // find the latest build in the out directory
  const latestBuild = findLatestBuild();
  // parse the directory and find paths and other info
  const appInfo = parseElectronApp(latestBuild);
  electronApp = await electron.launch({
    args: [appInfo.main],
    executablePath: appInfo.executable,
  });
});

test('Launch electron app', async () => {
  const appPath = await electronApp.evaluate(async ({app}) => {
    return app.getAppPath();
  });
  console.log('appPath', appPath);

  const page = await electronApp.firstWindow();

  const title = await page.title();
  expect(title).toBe('Monokle');

  await electronApp.close();
});
