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
