import {Locator, Page} from 'playwright';
import {v4 as uuidV4} from 'uuid';

export class StartProjectPane {

  private _page: Page;

  private readonly _selectExisingFolderLink: Locator;
  private readonly _startFromTemplateLink: Locator;

  private readonly _createEmptyProjectLink: Locator;
  private readonly _emptyProjectName: Locator;

  private readonly _emptyProjectSave: Locator;

  constructor(page: Page) {
    this._page = page;

    this._selectExisingFolderLink = page.locator('#select-existing-folder');
    this._startFromTemplateLink = page.locator('#start-from-template');

    this._createEmptyProjectLink = page.locator('#create-empty-project');
    this._emptyProjectName = page.locator('.ant-modal #name');

    this._emptyProjectSave = page.locator('#empty-project-save');
  }

  async createEmptyProject(name = `project-${uuidV4()}`) {
    await this._createEmptyProjectLink.click();
    await this._emptyProjectName.fill(name);

    await this._emptyProjectSave.click();

    return name;
  }

}
