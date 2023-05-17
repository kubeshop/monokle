import {BrowserWindow, Menu, app, globalShortcut, nativeImage} from 'electron';
import installExtension, {REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS} from 'electron-devtools-installer';
import log from 'electron-log';
import ElectronStore from 'electron-store';

import * as path from 'path';

import {trackEvent} from '@shared/utils';
import {logToFile} from '@shared/utils/logs';

import {createWindow} from './createWindow';
import {getDockMenu} from './menu';
import {PROXY_SERVICE} from './services/cluster/globals';

Object.assign(console, logToFile.functions);

const isDev = process.env.NODE_ENV === 'development';

export const openApplication = async (givenPath?: string) => {
  Menu.setApplicationMenu(null);
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

  app.on('quit', (_event, exitCode) => {
    PROXY_SERVICE.stopAll();
    trackEvent('APP_QUIT', {exitCode});
  });
};
