import {Locator, Page} from 'playwright';

export class NavigatorPane {

  private _page: Page;

  private readonly _createResourceButton: Locator;
  private readonly _sectionsContainer: Locator;
  private readonly _resourcesCount: Locator;

  constructor(page: Page) {
    this._page = page;

    this._createResourceButton = page.locator('#create-resource-button');
    this._sectionsContainer = page.locator('#navigator-sections-container');
    this._resourcesCount = page.locator('#navigator-sections-container li:first-child span > span:nth-child(2)');
  }

  async clickOnNewResource() {
    await this._createResourceButton.click();
  }

  get resourcesCount() {
    return this._resourcesCount;
  }

}
