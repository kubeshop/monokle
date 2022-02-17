import {Page} from 'playwright';
import {expect, test} from '@playwright/test';
import {ElectronApplication} from 'playwright-core';
import {ElectronAppInfo, startApp} from './electronHelpers';
import {pause} from './utils';
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

  await navigatorPane.clickOnNewResource();

  const kind = 'ClusterRole';
  const fileName = 'test-cluster-role';
  await newResourceModal.createResource(fileName, kind);

  expect(await editorPane.formTab.textContent()).toEqual(kind);

  await editorPane.saveResource();
  await saveResourceModal.clickSave();
  // pause for 1 sec to wait for file save
  await pause(1000);

  expect((await fileExplorerPane.projectName.textContent())?.includes(projectName)).toBe(true);
  expect(await fileExplorerPane.fileCount.textContent()).toEqual('1 files');
  expect((await fileExplorerPane.tree.textContent())?.includes(fileName)).toBe(true);
});

test.afterAll(async () => {
  await appWindow.screenshot({path: `test-output/${appInfo.platform}/screenshots/final-screen.png`});
  await appWindow.context().close();
  await appWindow.close();
});
