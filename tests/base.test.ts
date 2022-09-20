import log from 'loglevel';
import {Locator, Page} from 'playwright';

import {expect, test} from '@playwright/test';

import {findDrawer, findDropdown, waitForDrawerToHide, waitForDrawerToShow, waitForDropdownToShow} from './antdHelpers';
import {ElectronAppInfo, clickOnMonokleLogo, startApp} from './electronHelpers';
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
  appWindow.on('console', log.info);
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
  const img = appWindow.locator('#monokle-logo-header');
  expect(await img.count()).toBe(1);
});

test('Validate icons', async () => {
  let span = appWindow.locator("span[aria-label='bell']");
  expect(await span.count()).toBe(1);

  span = appWindow.locator("span[aria-label='ellipsis']");
  expect(await span.count()).toBe(1);
});

test('Validate ClusterContainer', async () => {
  const div = appWindow.locator("div[id='ClusterContainer']");
  expect(await div.count()).toBe(1);
});

test('Validate settings drawer', async () => {
  await appWindow.screenshot({path: getRecordingPath(appInfo.platform, 'before-settings-drawer.png')});
  let dropdown: Locator | undefined = await findDropdown(appWindow);
  let drawer = await findDrawer(appWindow, 'Settings');
  expect(drawer).toBeFalsy();

  await appWindow.click("span[aria-label='ellipsis']", {noWaitAfter: true, force: true});
  dropdown = await waitForDropdownToShow(appWindow, 40000);
  expect(dropdown).toBeTruthy();

  await appWindow.click(".ant-dropdown span[aria-label='setting']", {noWaitAfter: true, force: true});
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

test('Validate accept Telemetry', async () => {
  await appWindow.click("//span[@aria-label='bell' and contains(@class,'anticon')]", {
    noWaitAfter: true,
    force: true,
  });

  await appWindow.screenshot({path: getRecordingPath(appInfo.platform, 'notifications-drawer-telemetry-accept.png')});
  await waitForDrawerToShow(appWindow, 'Notifications', 5000);
  const buttonAccept = appWindow.locator('#accept-telemetry');
  expect(await buttonAccept.count()).toBe(1);
  await appWindow.click("#accept-telemetry", {noWaitAfter: true, force: true});
  expect(await waitForDrawerToHide(appWindow, 'Notifications')).toBeTruthy();
});

test('Validate decline Telemetry', async () => {
  await appWindow.click("//span[@aria-label='bell' and contains(@class,'anticon')]", {
    noWaitAfter: true,
    force: true,
  });

  await appWindow.screenshot({path: getRecordingPath(appInfo.platform, 'notifications-drawer-telemetry-decline.png')});
  await waitForDrawerToShow(appWindow, 'Notifications', 5000);
  const buttonDecline = appWindow.locator('#decline-telemetry');
  expect(await buttonDecline.count()).toBe(1);
  await appWindow.click('#decline-telemetry', {noWaitAfter: true, force: true});
  let drawer = await findDrawer(appWindow, 'Settings');
  expect(drawer).toBeTruthy();
});

test('Validate Walk Through Tooltip', async () => {
  await appWindow.hover("//span[@aria-label='ellipsis' and contains(@class,'anticon')]");

  const tooltipInvisible = appWindow.locator("//div[@role='tooltip']");
  expect(tooltipInvisible).toBeHidden();
  await appWindow.screenshot({path: getRecordingPath(appInfo.platform, 'settings-popover.png')});
  const popover = appWindow.locator('#menu-helpers');

  const buttonGuide = await popover.locator('button >> text=Re-play Quick Guide');
  expect(buttonGuide).toBeTruthy();
  await appWindow.click('button >> text=Re-play Quick Guide', {noWaitAfter: true, force: true});
  const tooltip = appWindow.locator("//div[@role='tooltip']");
  expect(tooltip).toBeTruthy();

});

test.afterAll(async () => {
  await appWindow.screenshot({path: getRecordingPath(appInfo.platform, 'final-screen.png')});
  await appWindow.close();
});
