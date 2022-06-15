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

export async function waitForDrawerToShow(page: Page, title: string, timeout?: number) {
  console.log(`waiting for drawer ${title} to show`);
  const drawer = page.locator(
    `//div[contains(@class,'ant-drawer') and contains(@class,'ant-drawer-open')]//div[contains(@class,'ant-drawer-title') and contains(text(),'${title}')]`
  );
  try {
    await drawer.elementHandle({timeout});
    return drawer;
  } catch (e: any) {
    console.log(`drawer ${title} did not show within ${timeout}ms`, e);
  }
}

export async function waitForDrawerToHide(page: Page, title: string, timeout?: number) {
  console.log(`waiting for drawer ${title} to hide`);
  const drawer = page.locator(
    `//div[contains(@class,'ant-drawer') and not(contains(@class,'ant-drawer-open'))]//div[contains(@class,'ant-drawer-title') and contains(text(),'${title}')]`
  );
  try {
    await drawer.elementHandle({timeout});
    return drawer;
  } catch (e: any) {
    console.log(`drawer ${title} did not hide within ${timeout}ms`, e);
  }
}

export async function findDrawer(page: Page, title: string) {
  const drawers = page.locator(`//div[contains(@class,'ant-drawer')]`);
  const count = await drawers.count();

  for (let c = 0; c < count; c += 1) {
    const drawer = drawers.nth(c);
    // eslint-disable-next-line no-await-in-loop
    const locator = await drawer.locator(`//div[contains(@class,'ant-drawer-title') and text()='${title}']`);
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

export async function waitForModalToShow(page: Page, title: string, timeout?: number) {
  console.log(`waiting for modal ${title}`);
  const modal = page.locator(
    `//div[contains(@class,'ant-modal-wrap') and not(contains(@style,'display: none')) and //div[@class='ant-modal-title']//text()='${title}']`
  );
  try {
    const elm = await modal.elementHandle({timeout});
    return modal;
  } catch (e: any) {
    console.log(`modal ${title} did not show within ${timeout}ms`, e.name);
  }
}

export async function closeModal(modal: Locator) {
  const closeIcon = modal.locator(`//span[contains(@class,'ant-modal-close-icon')]`);
  if (closeIcon) {
    closeIcon.click();
    return true;
  }
  return false;
}

export async function waitForModalToHide(page: Page, id: string, timeout?: number) {
  console.log(`waiting for modal ${id} to hide`);
  const modal = page.locator(
    `//div[contains(@class,'ant-modal-wrap') and contains(@style,'display: none') and //div[@class='ant-modal-title']//text()='${id}']`
  );
  try {
    const elm = await modal.elementHandle({timeout});
    return modal;
  } catch (e: any) {
    console.log(`modal ${id} did not hide within ${timeout}ms`, e);
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

export async function findDropdown(page: Page) {
  const dropdown = page.locator(`//div[contains(@class,'ant-dropdown')]`);
  return dropdown;
}

export async function waitForDropdownToShow(page: Page, timeout: number) {
  console.log(`waiting for dropdown`);
  const dropdown = page.locator(`//div[contains(@class,'ant-dropdown') and not(contains(@style,'display: none'))]`);
  try {
    const elm = await dropdown.elementHandle({timeout});
    return dropdown;
  } catch (e: any) {
    console.log(`dropdown  did not show within ${timeout}ms`, e.name);
  }
}

export async function waitForDropdownToHide(page: Page, timeout: number) {
  console.log(`waiting for dropdown`);
  const dropdown = page.locator(`//div[contains(@class,'ant-dropdown') and contains(@style,'display: none')]`);
  try {
    const elm = await dropdown.elementHandle({timeout});
    return dropdown;
  } catch (e: any) {
    console.log(`dropdown did not hide within ${timeout}ms`, e.name);
  }
}

export async function closeWalktrough(page: Page, timeout: number) {
  console.log(`closing walkthrough`);
  const walkthrough = page.locator(`#close-walkthrough >> visible=true`);
  try {
    await walkthrough.elementHandle({timeout});
    walkthrough.click();
  } catch (e: any) {
    console.log(`walkthrough did not hide within ${timeout}ms`, e.name);
  }
}

export async function closeTelemetry(page: Page, timeout: number) {
  console.log(`closing telemetry`);
  const telemetry = page.locator(`#accept-telemetry >> visible=true`);
  try {
    await telemetry.elementHandle({timeout});
    telemetry.click();
  } catch (e: any) {
    console.log(`telemetry did not hide within ${timeout}ms`, e.name);
  }
}
