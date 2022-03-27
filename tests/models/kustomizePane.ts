import {Locator, Page} from 'playwright';

export class KustomizePane {

  private _page: Page;

  private readonly _kustomizeItemsContainer: Locator;

  constructor(page: Page) {
    this._page = page;

    this._kustomizeItemsContainer = page.locator('#kustomize-sections-container');
  }

  get kustomizeItemsContainer() {
    return this._kustomizeItemsContainer;
  }

}
