import {Locator, Page} from 'playwright';

export class NewResourceModal {

  private _page: Page;

  private readonly _resourceName: Locator;
  private readonly _resourceKind: Locator;
  private readonly _okButton: Locator;

  constructor(page: Page) {
    this._page = page;

    this._resourceName = page.locator('#resource-name-input');
    this._resourceKind = page.locator('.ant-select-show-search #kind');
    this._okButton = page.locator('.ant-modal button:last-child');
  }

  async createResource(name: string, kind: string) {
    await this._resourceName.fill(name);
    await this._resourceKind.click();
    await this._resourceKind.fill(kind);
    await this._page.keyboard.press('Enter');

    await this._okButton.click();
  }

}
