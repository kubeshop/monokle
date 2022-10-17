import {BrowserWindow, app, globalShortcut, nativeImage} from 'electron';
import installExtension, {REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS} from 'electron-devtools-installer';
import ElectronStore from 'electron-store';

import log from 'loglevel';
import * as path from 'path';

import {logToFile} from '@utils/logToFile';

import {createWindow} from './createWindow';
import {getDockMenu} from './menu';

Object.assign(console, logToFile.functions);

const isDev = process.env.NODE_ENV === 'development';

export const openApplication = async (givenPath?: string) => {
  await app.whenReady();

  if (isDev) {
    // DevTools
    installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => log.info(`Added Extension:  ${name}`))
      .catch(err => log.error('An error occurred: ', err));

    installExtension(REDUX_DEVTOOLS)
      .then(name => log.info(`Added Extension:  ${name}`))
      .catch(err => log.error('An error occurred: ', err));
  }

  ElectronStore.initRenderer();
  const win = createWindow(givenPath);

  if (app.dock) {
    const image = nativeImage.createFromPath(path.join(app.getAppPath(), '/public/large-icon-256.png'));
    app.dock.setIcon(image);
    app.dock.setMenu(getDockMenu());
  }

  log.info('info', app.getName(), app.getVersion(), app.getLocale(), givenPath);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(givenPath);
    }
  });

  app.on('window-all-closed', () => {
    if (!isDev) {
      app.exit();
    }
  });

  app.on('browser-window-focus', () => {
    globalShortcut.register('CommandOrControl+R', () => {
      win.webContents.send('restart-preview');
    });

    globalShortcut.register('CommandOrControl+Shift+R', () => {
      win.reload();
    });
  });

  app.on('browser-window-blur', () => {
    globalShortcut.unregister('CommandOrControl+R');
    globalShortcut.unregister('CommandOrControl+Shift+R');
  });
};
