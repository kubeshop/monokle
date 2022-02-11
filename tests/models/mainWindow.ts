import {Locator, Page} from 'playwright';

export class MainWindow {

  private _page: Page;

  private readonly _theLogo: Locator;
  private readonly _projectsDropdown: Locator;
  private readonly _backToProject: Locator;
  private readonly _fileExplorerButton: Locator;

  constructor(page: Page) {
    this._page = page;

    this._theLogo = page.locator('#monokle-logo-header');
    this._projectsDropdown = page.locator('#projects-dropdown-container > button:first-child');
    this._backToProject = page.locator('#projects-dropdown-container > button:last-child');

    this._fileExplorerButton = page.locator('#file-explorer');
  }

  async clickLogo() {
    await this._theLogo.click();
  }

  get projectsDropdown() {
    return this._projectsDropdown;
  }

  async clickBackToProject() {
    await this._backToProject.click();
  }

  async clickFileExplorer() {
    await this._fileExplorerButton.click();
  }

}
