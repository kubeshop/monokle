/* eslint-disable import/order */
import {Page, _electron as electron} from 'playwright';

import {findDrawer, isDrawerVisible} from './antdHelpers';
import {findLatestBuild, parseElectronApp} from './electronHelpers';
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
    recordVideo: {dir: './test-output/videos', size: {width: 1200, height: 800}},
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
  appWindow.on( 'console', console.log );

  // Capture a screenshot.
  await appWindow.screenshot({path: 'test-output/screenshots/initial-screen.png'});
  await new Promise(f => setTimeout(f, 1000));
  await appWindow.screenshot({path: 'test-output/screenshots/post-startup-screen.png'});
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
  const count = await img.count();
  expect(count).toBe(1);
});

test('Validate icons', async () => {
  let span = appWindow.locator("span[aria-label='question-circle']");
  let count = await span.count();
  expect(count).toBe(1);
  const img = appWindow.locator("img[src*='DiscordLogo'][src$='.svg']");
  count = await img.count();
  expect(count).toBe(1);
  span = appWindow.locator("span[aria-label='github']");
  count = await span.count();
  expect(count).toBe(1);
  span = appWindow.locator("span[aria-label='bell']");
  count = await span.count();
  expect(count).toBe(1);
  span = appWindow.locator("span[aria-label='setting']");
  count = await span.count();
  expect(count).toBe(1);
});

test('Validate main sections', async () => {
  const navigator = appWindow.locator('text=Navigator');
  let count = await navigator.count();
  expect(count).toBe(1);
  const fileExplorer = appWindow.locator('text="File Explorer"');
  count = await fileExplorer.count();
  expect(count).toBe(1);
  const editor = appWindow.locator('text=Editor');
  count = await editor.count();
  expect(count).toBe(1);
});

test('Validate clustercontainer', async () => {
  const div = appWindow.locator("div[id='ClusterContainer']");
  expect(await div.count()).toBe(1);
});

test('Validate settings drawer', async () => {
  let drawer = await findDrawer(appWindow, 'Settings');
  expect(drawer).toBeFalsy();

  const settingsIcon = appWindow.locator("span[aria-label='setting']");
  expect(await settingsIcon.count()).toBe(1);

  settingsIcon.click({noWaitAfter: true, force: true});
  await new Promise(f => setTimeout(f, 500));

  drawer = await findDrawer(appWindow, 'Settings');
  expect(drawer).toBeTruthy();

  // @ts-ignore
  expect(await isDrawerVisible(drawer)).toBeTruthy();

  appWindow.click("img[src*='MonokleKubeshopLogo'][src$='.svg']", {noWaitAfter: true, force: true});
  await new Promise(f => setTimeout(f, 500));

  // @ts-ignore
  expect(await isDrawerVisible(drawer)).toBeFalsy();
});

test('Validate notifications drawer', async () => {
  let drawer = await findDrawer(appWindow, 'Notifications');
  expect(drawer).toBeFalsy();

  const notificationsIcon = appWindow.locator("span[aria-label='bell']");
  expect(await notificationsIcon.count()).toBe(1);

  notificationsIcon.click({noWaitAfter: true, force: true});
  await new Promise(f => setTimeout(f, 500));

  drawer = await findDrawer(appWindow, 'Notifications');
  expect(drawer).toBeTruthy();

  // @ts-ignore
  expect(await isDrawerVisible(drawer)).toBeTruthy();

  appWindow.click("img[src*='MonokleKubeshopLogo'][src$='.svg']", {noWaitAfter: true, force: true});
  await new Promise(f => setTimeout(f, 500));

  // @ts-ignore
  expect(await isDrawerVisible(drawer)).toBeFalsy();
});

test('Validate github redirect', async () => {
  const githubIcon = appWindow.locator("span[aria-label='github']");
  expect(await githubIcon.count()).toBe(1);

  await githubIcon.click();
});

test.afterAll(async () => {
  await appWindow.screenshot({path: 'test-output/screenshots/final-screen.png'});
  await appWindow.context().close();
  await appWindow.close();
});
