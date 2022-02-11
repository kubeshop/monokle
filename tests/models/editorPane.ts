import {Locator, Page} from "playwright";

export class EditorPane {

  private _page: Page;

  private readonly _editorPane: Locator;

  private readonly _saveButton: Locator;

  private readonly _sourceTab: Locator;
  private readonly _formTab: Locator;
  private readonly _metadataTab: Locator;

  constructor(page: Page) {
    this._page = page;

    this._editorPane = page.locator('#EditorPane');
    this._sourceTab = page.locator('#EditorPane .ant-tabs-nav-list > div.ant-tabs-tab:first-child');
    this._formTab = page.locator('#EditorPane .ant-tabs-nav-list > div.ant-tabs-tab:nth-child(2)');
    this._metadataTab = page.locator('#EditorPane .ant-tabs-nav-list > div.ant-tabs-tab:last-child');
    this._saveButton = page.locator('#EditorPane #save-button');
  }

  get formTab() {
    return this._formTab;
  }

  async saveResource() {
    await this._saveButton.click();
  }

}
