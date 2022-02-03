import {Locator, Page} from 'playwright';
import { v4 as uuidV4 } from 'uuid';
import { ElectronApplication } from 'playwright-core';
import { getChannelName } from '../../src/utils/ipc';

export class ProjectsDropdown {

  private _page: Page;

  private readonly _theLogo: Locator;
  private readonly _projectsDropdown: Locator;
  private readonly _openProjectFromFolder: Locator;

  constructor(page: Page) {
    this._page = page;

    this._theLogo = page.locator('#monokle-logo-header');
    this._projectsDropdown = page.locator('#projects-dropdown-container > button:first-child');
    this._openProjectFromFolder = page.locator('div.ant-dropdown ul.ant-dropdown-menu #open-new-project');
  }

  async createNewProject(electronApp: ElectronApplication, name = `project-${uuidV4()}`) {
    await this._projectsDropdown.click();

    const chanel = getChannelName('select-file', true);
    await electronApp.evaluate(({ ipcMain }, params) => {
      ipcMain.handle(params.chanel, () => {
        return [params.name];
      });
    }, { chanel, name });

    await this._openProjectFromFolder.click();

    await electronApp.evaluate(({ ipcMain }, params) => {
      ipcMain.removeAllListeners(params.chanel);
    }, { chanel });

    return name;
  }

}
