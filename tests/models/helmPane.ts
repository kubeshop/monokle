import {Locator, Page} from 'playwright';

export class HelmPane {

  private _page: Page;

  private readonly _helmItemsContainer: Locator;

  constructor(page: Page) {
    this._page = page;

    this._helmItemsContainer = page.locator('#helm-sections-container');
  }

  get helmItemsContainer() {
    return this._helmItemsContainer;
  }

}
