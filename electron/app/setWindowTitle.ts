import {BrowserWindow} from 'electron';

export const setWindowTitle = (title: string | undefined, window: BrowserWindow) => {
  if (window.isDestroyed()) {
    return;
  }
  let windowTitle = title || 'Monokle';

  window.setTitle(windowTitle);
};
