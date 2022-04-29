import {Locator, Page} from 'playwright';
import {v4 as uuidV4} from 'uuid';
import {ElectronApplication} from 'playwright-core';
import {getChannelName} from '../../src/utils/ipc';
import {mockHandle} from './util';

export class StartProjectPane {

  private _page: Page;

  private readonly _selectExisingFolderLink: Locator;
  private readonly _startFromTemplateLink: Locator;

  private readonly _createEmptyProjectLink: Locator;
  private readonly _emptyProjectName: Locator;
  private readonly _projectLocation: Locator;

  private readonly _emptyProjectSave: Locator;

  constructor(page: Page) {
    this._page = page;

    this._selectExisingFolderLink = page.locator('#select-existing-folder');
    this._startFromTemplateLink = page.locator('#start-from-template');

    this._createEmptyProjectLink = page.locator('#create-empty-project');
    this._emptyProjectName = page.locator('.ant-modal #name');
    this._projectLocation = page.locator('.ant-modal #rootFolder');

    this._emptyProjectSave = page.locator('#empty-project-save');
  }

  async createEmptyProject(name = `project-${uuidV4()}`) {
    await this._createEmptyProjectLink.click();
    await this._emptyProjectName.fill(name);

    await this._emptyProjectSave.click();

    return name;
  }

  async createProjectFromFolder(electronApp: ElectronApplication, path: string) {
    const chanel = getChannelName('select-file', true);
    await mockHandle(electronApp, chanel, path);

    await this._selectExisingFolderLink.click();

    await electronApp.evaluate(({ ipcMain }, params) => {
      ipcMain.removeAllListeners(params.chanel);
    }, { chanel });
  }

  get createEmptyProjectLink(): Locator {
    return this._createEmptyProjectLink;
  }

  get emptyProjectName(): Locator {
    return this._emptyProjectName;
  }

  get emptyProjectSave(): Locator {
    return this._emptyProjectSave;
  }

  get projectLocation(): Locator {
    return this._projectLocation;
  }
}
