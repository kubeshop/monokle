import {Locator, Page} from 'playwright';

export class MainWindow {

  private _page: Page;

  private readonly _theLogo: Locator;
  private readonly _projectsDropdown: Locator;
  private readonly _backToProject: Locator;
  private readonly _fileExplorerButton: Locator;
  private readonly _kustomizeButton: Locator;
  private readonly _helmButton: Locator;

  constructor(page: Page) {
    this._page = page;

    this._theLogo = page.locator('#monokle-logo-header');
    this._projectsDropdown = page.locator('#projects-dropdown-container > button:first-child');
    this._backToProject = page.locator('#projects-dropdown-container > button:last-child');

    this._fileExplorerButton = page.locator('#file-explorer');
    this._kustomizeButton = page.locator('#kustomize-pane');
    this._helmButton = page.locator('#helm-pane');
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

  async showFileExplorerIfNotVisible() {
    let isVisible: boolean;
    try {
      isVisible = await this._page.locator('#FileExplorer').isVisible();
    } catch (e) {
      isVisible = false;
    }

    if (isVisible) {
      return;
    }

    await this._fileExplorerButton.click();
  }

  async clickKustomizeButton() {
    await this._kustomizeButton.click();
  }

  async clickHelmButton() {
    await this._helmButton.click();
  }

}
