/* eslint-disable no-await-in-loop */
import {execSync} from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import {Page} from 'playwright';
import {ElectronApplication} from 'playwright-core';

import {expect, test} from '@playwright/test';

import {ElectronAppInfo, startApp} from './electronHelpers';
import {FileExplorerPane} from './models/fileExplorerPane';
import {HelmPane} from './models/helmPane';
import {KustomizePane} from './models/kustomizePane';
import {MainWindow} from './models/mainWindow';
import {NavigatorPane} from './models/navigatorPane';
import {StartProjectPane} from './models/startProjectPane';
import {getRecordingPath, pause} from './utils';

let appWindow: Page;
let appInfo: ElectronAppInfo;
let electronApp: ElectronApplication;

const clonePath = path.join(__dirname, '..', '..');
const projectPath = path.join(clonePath, 'manifest-test-data');
const repo = 'https://github.com/kubeshop/manifest-test-data';

let mainWindow: MainWindow;
let fileExplorerPane: FileExplorerPane;
let kustomizePane: KustomizePane;
let helmPane: HelmPane;
let startProjectPane: StartProjectPane;
let navigatorPane: NavigatorPane;

test.beforeAll(async () => {
  const startAppResponse = await startApp();
  appWindow = startAppResponse.appWindow;
  appInfo = startAppResponse.appInfo;
  electronApp = startAppResponse.electronApp;

  mainWindow = new MainWindow(appWindow);
  fileExplorerPane = new FileExplorerPane(appWindow);
  kustomizePane = new KustomizePane(appWindow);
  helmPane = new HelmPane(appWindow);
  startProjectPane = new StartProjectPane(appWindow);
  navigatorPane = new NavigatorPane(appWindow);

  appWindow.on('console', console.log);

  execSync(`git clone ${repo}`, {
    cwd: `${clonePath}`,
  });
});

const startCommit = 'aeb1e59a03913b00020eca6ac2a416d085f34a6b';
const removeSomeFiles = 'f5518240cf7cac1f686c1bc9e4ca8099bfd7daa1';
const removeMoreFiles = '28879f29f62c8357b5ca988e475db30e13c8300b';

async function goToCommit(hash: string) {
  console.log('*******************************************************');
  execSync(`git checkout ${hash}`, {
    cwd: `${projectPath}`,
  });
  console.log('*******************************************************');

  await pause(5000);
}

const testData = [
  {
    hash: startCommit,
    fileExplorerCount: 54,
    kustomizeCount: 13,
    helmCount: 13,
    navigatorCount: 35,
  },
  {
    hash: removeSomeFiles,
    fileExplorerCount: 33,
    kustomizeCount: 6,
    helmCount: 13,
    navigatorCount: 28,
  },
  {
    hash: removeMoreFiles,
    fileExplorerCount: 16,
    kustomizeCount: 3,
    helmCount: 13,
    navigatorCount: 15,
  },
  {
    hash: startCommit,
    fileExplorerCount: 54,
    kustomizeCount: 13,
    helmCount: 13,
    navigatorCount: 35,
  },
];

test.only('all files should be loaded', async () => {
  await appWindow.screenshot({path: getRecordingPath(appInfo.platform, 'before-git-test.png')});

  await mainWindow.clickLogo();
  await startProjectPane.createProjectFromFolder(electronApp, projectPath);
  await pause(10000);

  // eslint-disable-next-line no-restricted-syntax
  for (const data of testData) {
    console.log(`testing commit hash: ${data.hash}`);
    await goToCommit(data.hash);
    await pause(10000);

    expect(parseInt(await navigatorPane.resourcesCount.textContent(), 10)).toEqual(data.navigatorCount);

    await mainWindow.showFileExplorerIfNotVisible();

    await appWindow.screenshot({path: getRecordingPath(appInfo.platform, `before-project-check-${data.hash}.png`)});
    expect((await fileExplorerPane.projectName.textContent())?.includes(projectPath)).toBe(true);
    expect(await fileExplorerPane.fileCount.textContent()).toEqual(`${data.fileExplorerCount} files`);

    await mainWindow.clickKustomizeButton();
    const kustomizeInnerTexts = (await kustomizePane.kustomizeItemsContainer.allInnerTexts())[0].split('\n');
    expect(kustomizeInnerTexts.length).toEqual(data.kustomizeCount);

    await mainWindow.clickHelmButton();
    const helmInnerTexts = (await helmPane.helmItemsContainer.allInnerTexts())[0].split('\n');
    expect(helmInnerTexts.length).toEqual(data.helmCount);
  }
});

test.afterAll(async () => {
  await appWindow.screenshot({path: getRecordingPath(appInfo.platform, 'final-screen.png')});
  await appWindow.close();
  fs.rmSync(projectPath, {recursive: true, force: true});
});
