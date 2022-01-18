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
  await appWindow.screenshot({path: 'test-output/screenshots/initial-screen.png'});
  await pause(1000);
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

function clickOnMonokleLogo() {
  appWindow.click("img[src*='MonokleKubeshopLogo'][src$='.svg']", {noWaitAfter: true, force: true});
}

test('Validate settings drawer', async () => {
  let drawer = await findDrawer(appWindow, 'Settings');
  expect(drawer).toBeFalsy();

  const settingsIcon = appWindow.locator("span[aria-label='setting']");
  expect(await settingsIcon.count()).toBe(1);

  await settingsIcon.click({noWaitAfter: true, force: true});
  await pause(500);

  drawer = await waitForDrawerToShow(appWindow, 'Settings', 5000);
  expect(drawer).toBeTruthy();

  clickOnMonokleLogo();

  expect(await waitForDrawerToHide(appWindow, 'Settings', 5000)).toBeTruthy();
  await pause(5000);
});

test('Validate notifications drawer', async () => {
  let drawer = await findDrawer(appWindow, 'Notifications');
  expect(drawer).toBeFalsy();

  const notificationsIcon = appWindow.locator("span[aria-label='bell']");
  expect(await notificationsIcon.count()).toBe(1);

  await notificationsIcon.click({noWaitAfter: true, force: true});
  await pause(500);

  drawer = await waitForDrawerToShow(appWindow, 'Notifications', 5000);
  expect(drawer).toBeTruthy();

  clickOnMonokleLogo();

  expect(await waitForDrawerToHide(appWindow, 'Notifications', 5000)).toBeTruthy();
  await pause(5000);
});

test('Validate monokle popup', async () => {
  await clickOnMonokleLogo();

  expect(await waitForModalToShow(appWindow, 'WelcomeModal', 5000)).toBeTruthy();
  await clickOnMonokleLogo();

  // @ts-ignore
  expect(await waitForModalToHide(appWindow, 'WelcomeModal', 5000)).toBeTruthy();
});

test('Validate left section tabs', async () => {
  let leftsection = appWindow.locator("div[id='LeftToolbar']");
  let buttons = leftsection.locator('button');
  expect(await buttons.count()).toBe(3);

  const fileExplorer = appWindow.locator("div > div[id='FileExplorer']");
  expect(await fileExplorer.count()).toBe(1);
  expect(await isInvisible(fileExplorer)).toBeFalsy();

  buttons.nth(1).click({noWaitAfter: true, force: true});
  await pause(1000);

  const kustomize = appWindow.locator("div > span[id='KustomizePane']");
  expect(await kustomize.count()).toBe(1);
  expect(await isInvisible(kustomize)).toBeFalsy();

  buttons.nth(2).click({noWaitAfter: true, force: true});
  await pause(1000);

  const helm = appWindow.locator("div > span[id='HelmPane']");
  expect(await helm.count()).toBe(1);
  expect(await isInvisible(helm)).toBeFalsy();

  buttons.nth(0).click({noWaitAfter: true, force: true});
  await pause(1000);

  buttons.nth(0).click({noWaitAfter: true, force: true});
  await pause(1000);

  const leftpane = appWindow.locator("div[id='LeftPane']");
  expect(await leftpane.count()).toBe(1);
  expect(await isInvisible(leftpane)).toBeTruthy();

  buttons.nth(0).click({noWaitAfter: true, force: true});
  await pause(1000);
});

test('Validate open folder', async () => {
  const folder = path.resolve(`tests${path.sep}argo-rollouts`);
  await electronApp.evaluate(async (app, f) => {
    app.webContents.getFocusedWebContents().send('set-root-folder', f);
  }, folder);

  await pause(5000);

  const footer = appWindow.locator('footer');
  await expect(footer).toContainText('26 files');
});

test.afterAll(async () => {
  await appWindow.screenshot({path: 'test-output/screenshots/final-screen.png'});
  await appWindow.context().close();
  await appWindow.close();
});

async function pause(ms: number) {
  await new Promise(f => setTimeout(f, ms));
}
