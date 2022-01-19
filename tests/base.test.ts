/* eslint-disable import/order */
import path from 'path';
import {Page, _electron as electron} from 'playwright';

import {
  findDrawer,
  isInvisible,
  waitForDrawerToHide,
  waitForDrawerToShow,
  waitForModalToHide,
  waitForModalToShow,
} from './antdHelpers';
import {ElectronAppInfo, findLatestBuild, parseElectronApp} from './electronHelpers';
import {ElectronApplication, expect, test} from '@playwright/test';

let electronApp: ElectronApplication;
let appWindow: Page;
let appInfo: ElectronAppInfo;

test.beforeAll(async () => {
  // find the latest build in the out directory
  const latestBuild = findLatestBuild();
  // parse the directory and find paths and other info
  appInfo = parseElectronApp(latestBuild);
  electronApp = await electron.launch({
    args: [appInfo.main],
    executablePath: appInfo.executable,
    recordVideo: {dir: `./test-output/${appInfo.platform}/videos`, size: {width: 1200, height: 800}},
  });

  // wait for splash-screen to pass
  await electronApp.firstWindow();
  while (electronApp.windows().length === 2) {
    // eslint-disable-next-line no-await-in-loop
    await pause(100);
  }

  const windows = electronApp.windows();
  expect(windows.length).toBe(1);
  appWindow = windows[0];
  appWindow.on('console', console.log);

  if (await waitForModalToShow(appWindow, 'WelcomeModal', 20000)) {
    await clickOnMonokleLogo();
    await pause(500);
    await waitForModalToHide(appWindow, 'WelcomeModal');
  }

  // Capture a screenshot.
  await appWindow.screenshot({path: `test-output/${appInfo.platform}/screenshots/initial-screen.png`});
});

test.beforeEach(async () => {
  await pause(1000);
});

test.afterEach(async () => {
  await pause(1000);
  appWindow.on('console', console.log);
});

test('Validate title', async () => {
  const title = await appWindow.title();
  expect(title).toBe('Monokle');
});

test('Validate footer', async () => {
  const footer = appWindow.locator('footer');
  await expect(footer).toContainText('Monokle');
  await expect(footer).toContainText('kubeshop.io');
});

test('Validate logo', async () => {
  const img = appWindow.locator("img[src*='MonokleKubeshopLogo'][src$='.svg']");
  expect(await img.count()).toBe(1);
});

test('Validate icons', async () => {
  let span = appWindow.locator("span[aria-label='question-circle']");
  expect(await span.count()).toBe(1);

  const img = appWindow.locator("img[src*='DiscordLogo'][src$='.svg']");
  expect(await img.count()).toBe(1);

  span = appWindow.locator("span[aria-label='github']");
  expect(await span.count()).toBe(1);

  span = appWindow.locator("span[aria-label='bell']");
  expect(await span.count()).toBe(1);

  span = appWindow.locator("span[aria-label='setting']");
  expect(await span.count()).toBe(1);
});

test('Validate ClusterContainer', async () => {
  const div = appWindow.locator("div[id='ClusterContainer']");
  expect(await div.count()).toBe(1);
});

async function clickOnMonokleLogo() {
  await appWindow.click("img[src*='MonokleKubeshopLogo'][src$='.svg']", {noWaitAfter: true, force: true});
}

test('Validate settings drawer', async () => {
  let drawer = await findDrawer(appWindow, 'Settings');
  expect(drawer).toBeFalsy();

  appWindow.click("span[aria-label='setting']", {noWaitAfter: true, force: true});
  drawer = await waitForDrawerToShow(appWindow, 'Settings');
  expect(drawer).toBeTruthy();

  await clickOnMonokleLogo();

  expect(await waitForDrawerToHide(appWindow, 'Settings')).toBeTruthy();
});

test('Validate notifications drawer', async () => {
  appWindow.click("//span[@aria-label='bell' and contains(@class,'anticon')]", {
    noWaitAfter: true,
    force: true,
  });

  expect(await waitForDrawerToShow(appWindow, 'Notifications', 5000)).toBeTruthy();
  await clickOnMonokleLogo();

  expect(await waitForDrawerToHide(appWindow, 'Notifications')).toBeTruthy();
});

test('Validate monokle popup', async () => {
  await clickOnMonokleLogo();

  expect(await waitForModalToShow(appWindow, 'WelcomeModal')).toBeTruthy();
  await clickOnMonokleLogo();

  expect(await waitForModalToHide(appWindow, 'WelcomeModal')).toBeTruthy();
});

test('Validate open folder', async () => {
  const folder = path.resolve(`tests${path.sep}argo-rollouts`);
  await electronApp.evaluate(async (app, f) => {
    app.webContents.getFocusedWebContents().send('set-root-folder', f);
  }, folder);

  await pause(10000);

  const footer = appWindow.locator('footer');
  await expect(footer).toContainText('26 files');
});

test.afterAll(async () => {
  await appWindow.screenshot({path: `test-output/${appInfo.platform}/screenshots/final-screen.png`});
  await appWindow.context().close();
  await appWindow.close();
});

async function pause(ms: number) {
  await new Promise(f => setTimeout(f, ms));
}
