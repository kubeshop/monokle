import {Locator, Page} from 'playwright';

export async function isDrawerVisible(drawer: Locator) {
  const elm = await drawer.elementHandle();
  if (!elm) {
    console.log('failed to get drawer element handle');
    return false;
  }

  const value = await elm.getAttribute('class');
  return value && value.includes('ant-drawer-open');
}

export async function findDrawer(page: Page, title: string) {
  const drawers = page.locator(`//div[contains(@class,'ant-drawer')]`);
  const count = await drawers.count();
  console.log(`found ${count} drawers`);

  for (let c = 0; c < count; c += 1) {
    const drawer = drawers.nth(c);
    // eslint-disable-next-line no-await-in-loop
    const locator = await drawer.locator(`//div[contains(@class,'ant-drawer-title')][text()='${title}']`);
    // eslint-disable-next-line no-await-in-loop
    const cnt = await locator.count();
    if (cnt === 1) {
      return drawer;
    }
  }
}
export async function findModal(page: Page, title: string) {
  const modals = page.locator(`//div[contains(@class,'ant-modal-root')]`);
  const count = await modals.count();
  console.log(`found ${count} modals`);

  for (let c = 0; c < count; c += 1) {
    const modal = modals.nth(c);
    // eslint-disable-next-line no-await-in-loop
    const locator = await modal.locator(`//span[contains(@id, '${title}')]`);
    // eslint-disable-next-line no-await-in-loop
    const cnt = await locator.count();
    if (cnt === 1) {
      return modal;
    }
  }
}
export async function isModalVisible(modal: Locator) {
  const locator = modal.locator('div[style*="display: none;"]');
  const count = await locator.count();
  return count === 0;
}
export async function isInvisible(leftsection: Locator) {
  const locator = leftsection.locator('div[style*="display: none;"]');
  //  locator.waitFor({state: 'attached'});
  const count = await locator.count();

  if (count > 0) {
    return true;
  }

  const style = await leftsection.getAttribute('style');
  return style && style.includes('display: none;');
}
