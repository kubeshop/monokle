import {Locator, Page} from 'playwright';

export class NavigatorPane {

  private _page: Page;

  private readonly _createResourceButton: Locator;

  constructor(page: Page) {
    this._page = page;

    this._createResourceButton = page.locator('#create-resource-button');
  }

  async clickOnNewResource() {
    await this._createResourceButton.click();
  }

}
