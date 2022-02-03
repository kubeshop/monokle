import {Locator, Page} from 'playwright';

export class FileExplorerPane {

  private _page: Page;

  private readonly _projectName: Locator;
  private readonly _fileCount: Locator;
  private readonly _tree: Locator;

  constructor(page: Page) {
    this._page = page;

    this._projectName = page.locator('#file-explorer-project-name');
    this._fileCount = page.locator('#file-explorer-count');
    this._tree = page.locator('.ant-tree-list');
  }

  get projectName() {
    return this._projectName;
  }

  get fileCount() {
    return this._fileCount;
  }

  get tree() {
    return this._tree;
  }

}
