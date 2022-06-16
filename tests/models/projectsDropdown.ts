import {Locator, Page} from 'playwright';
import {ElectronApplication} from 'playwright-core';
import {v4 as uuidV4} from 'uuid';

import {getChannelName} from '../../src/utils/ipc';
import {mockHandle} from './util';

export class ProjectsDropdown {
  private _page: Page;

  private readonly _theLogo: Locator;
  private readonly _projectsDropdown: Locator;
  private readonly _openProjectFromFolder: Locator;

  constructor(page: Page) {
    this._page = page;

    this._theLogo = page.locator('#monokle-logo-header');
    this._projectsDropdown = page.locator('#projects-dropdown-container button:first-child div:nth-child(2)');
    this._openProjectFromFolder = page.locator('div.ant-dropdown #open-new-project');
  }

  async createNewProject(electronApp: ElectronApplication, name = `project-${uuidV4()}`) {
    await this._projectsDropdown.click();
    const chanel = getChannelName('select-file', true);
    await mockHandle(electronApp, chanel, name);

    await this._openProjectFromFolder.click();

    await electronApp.evaluate(
      ({ipcMain}, params) => {
        ipcMain.removeAllListeners(params.chanel);
      },
      {chanel}
    );

    return name;
  }

  async click() {
    await this._projectsDropdown.click();
  }
}
