import {Page} from 'playwright';
import {expect, test} from '@playwright/test';
import {ElectronApplication} from 'playwright-core';
import {v4 as uuidV4} from 'uuid';
import {readdirSync} from 'fs';

import {ElectronAppInfo, startApp} from './electronHelpers';
import {getRecordingPath, pause} from './utils';
import {StartProjectPane} from './models/startProjectPane';
import {MainWindow} from './models/mainWindow';
import {ProjectsDropdown} from './models/projectsDropdown';
import {NavigatorPane} from './models/navigatorPane';
import {NewResourceModal} from './models/newResourceModal';
import {EditorPane} from './models/editorPane';
import {SaveResourceModal} from './models/saveResourceModal';
import {FileExplorerPane} from './models/fileExplorerPane';

let appWindow: Page;
let electronApp: ElectronApplication;
let appInfo: ElectronAppInfo;

let startPane: StartProjectPane;
let mainWindow: MainWindow;
let projectsDropdown: ProjectsDropdown;
let navigatorPane: NavigatorPane;
let newResourceModal: NewResourceModal;
let editorPane: EditorPane;
let saveResourceModal: SaveResourceModal;
let fileExplorerPane: FileExplorerPane;

test.beforeAll(async () => {
  const startAppResponse = await startApp();
  appWindow = startAppResponse.appWindow;
  electronApp = startAppResponse.electronApp;
  appInfo = startAppResponse.appInfo;
  startPane = new StartProjectPane(appWindow);
  mainWindow = new MainWindow(appWindow);
  projectsDropdown = new ProjectsDropdown(appWindow);
  navigatorPane = new NavigatorPane(appWindow);
  newResourceModal = new NewResourceModal(appWindow);
  editorPane = new EditorPane(appWindow);
  saveResourceModal = new SaveResourceModal(appWindow);
  fileExplorerPane = new FileExplorerPane(appWindow);
});

test.beforeEach(async () => {
  await pause(1000);
  // click on logo to always start on the same screen
  await mainWindow.clickLogo();
});

test.afterEach(async () => {
  await pause(1000);
});

test('should create empty project from welcome screen', async () => {
  const name = await startPane.createEmptyProject();

  const currentProject = await mainWindow.projectsDropdown.textContent();
  expect(name).toEqual(currentProject);
});

test('should create empty project from projects dropdown', async () => {
  const name = await projectsDropdown.createNewProject(electronApp);

  const currentProject = await mainWindow.projectsDropdown.textContent();
  expect(name).toEqual(currentProject);
});

test('should create new resource', async () => {
  const projectName = await startPane.createEmptyProject();

  await appWindow.screenshot({path: getRecordingPath(appInfo.platform, 'after-project-creation.png')});
  // pause for 2 sec to wait for project load
  await pause(2000);
  await navigatorPane.clickOnNewResource();

  const kind = 'ClusterRole';
  const fileName = 'test-cluster-role';
  await newResourceModal.createResource(fileName, kind);
  await navigatorPane.clickLastFile();

  expect(await editorPane.formTab.textContent()).toEqual('Form');

  await editorPane.saveResource();
  await saveResourceModal.clickSave();
  // pause for 1 sec to wait for file save
  await pause(1000);

  expect((await fileExplorerPane.projectName.textContent())?.includes(projectName)).toBe(true);
  expect(await fileExplorerPane.fileCount.textContent()).toEqual('2 files');
  expect((await fileExplorerPane.tree.textContent())?.includes(fileName)).toBe(true);
});

test('should autocomplete path & create .monokle file', async () => {
  const projectName = `project-${uuidV4()}`;
  await startPane.createEmptyProjectLink.click();
  await startPane.emptyProjectName.fill(projectName);

  const projectPath = await startPane.projectLocation.inputValue();
  expect(projectPath?.includes(projectName)).toEqual(true);

  await startPane.emptyProjectSave.click();
  // pause for 2 sec to wait for project load
  await pause(2000);

  const projectContents = readdirSync(projectPath as string);
  projectContents.includes('.monokle');

  await projectsDropdown.click();
  const pathColumn = appWindow.locator(`.ant-dropdown-menu [title="${projectPath}"]`);
  expect(await pathColumn.textContent()).toEqual(projectPath);

  const nameColumn = appWindow.locator(`.ant-dropdown-menu [title="${projectName}"]`);
  expect(await nameColumn.textContent()).toEqual(projectName);
});

test('should delete project', async () => {
  const projectName = await startPane.createEmptyProject();
  await pause(2000);

  await projectsDropdown.click();
  const nameColumn = appWindow.locator(`.ant-dropdown-menu [title="${projectName}"]`);
  await nameColumn.hover();
  await appWindow.locator('.ant-table-cell-row-hover span.anticon-delete').click();
  await appWindow.locator('.ant-modal-confirm-confirm button.ant-btn-primary').click();
  await pause(2000);

  expect(await appWindow.locator('#recent-project-title').isVisible()).toEqual(true);
  expect(
    (await appWindow.locator('#recent-projects-container').textContent())?.includes(projectName)
  ).toEqual(false);
});

test.afterAll(async () => {
  await appWindow.screenshot({path: `test-output/${appInfo.platform}/screenshots/final-screen.png`});
  await appWindow.close();
});
