import {Locator, Page} from 'playwright';
import { closeNotification } from '../antdHelpers';

export class SaveResourceModal {

  private _page: Page;

  private readonly _okButton: Locator;

  constructor(page: Page) {
    this._page = page;

    this._okButton = page.locator('.save-resource .ant-modal-footer > button:last-child');
  }

  async clickSave() {
    await this._okButton.click();
    await closeNotification(this._page, 5000);
  }

}
