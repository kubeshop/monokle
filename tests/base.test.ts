import {Page} from 'playwright';
import {expect, test} from '@playwright/test';
import {
  findDrawer,
  waitForDrawerToHide,
  waitForDrawerToShow,
} from './antdHelpers';
import {clickOnMonokleLogo, ElectronAppInfo, startApp} from './electronHelpers';
import {getRecordingPath, pause} from './utils';

let appWindow: Page = {} as any;
let appInfo: ElectronAppInfo = {} as any;

test.beforeAll(async () => {
  const startAppResponse = await startApp();
  appWindow = startAppResponse.appWindow;
  appInfo = startAppResponse.appInfo;
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
  const img = appWindow.locator("#monokle-logo-header");
  expect(await img.count()).toBe(1);
});

test('Validate icons', async () => {
  let span = appWindow.locator("span[aria-label='question-circle']");
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

test('Validate settings drawer', async () => {
  await appWindow.screenshot({path: getRecordingPath(appInfo.platform, 'before-settings-drawer.png')});
  let drawer = await findDrawer(appWindow, 'Settings');
  expect(drawer).toBeFalsy();

  await appWindow.click("span[aria-label='setting']", {noWaitAfter: true, force: true});
  await appWindow.screenshot({path: getRecordingPath(appInfo.platform, 'settings-drawer.png')});
  drawer = await waitForDrawerToShow(appWindow, 'Settings', 40000);

  expect(drawer).toBeTruthy();

  await clickOnMonokleLogo(appWindow);

  expect(await waitForDrawerToHide(appWindow, 'Settings')).toBeTruthy();
});

test('Validate notifications drawer', async () => {
  await appWindow.click("//span[@aria-label='bell' and contains(@class,'anticon')]", {
    noWaitAfter: true,
    force: true,
  });

  await appWindow.screenshot({path: getRecordingPath(appInfo.platform, 'notifications-drawer.png')});
  expect(await waitForDrawerToShow(appWindow, 'Notifications', 5000)).toBeTruthy();
  await clickOnMonokleLogo(appWindow);

  expect(await waitForDrawerToHide(appWindow, 'Notifications')).toBeTruthy();
});

test.afterAll(async () => {
  await appWindow.screenshot({path: getRecordingPath(appInfo.platform, 'final-screen.png')});
  await appWindow.close();
});
