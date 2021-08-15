import {app, BrowserWindow, nativeImage, ipcMain} from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import installExtension, {REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS} from 'electron-devtools-installer';
import {execSync} from 'child_process';
import * as ElectronLog from 'electron-log';

import {APP_MIN_HEIGHT, APP_MIN_WIDTH} from '../src/constants/constants';

Object.assign(console, ElectronLog.functions);

const ElectronStore = require('electron-store');
const {autoUpdater} = require('electron-updater'); // Hacky way to fix for `Conflicting definitions for 'node'` error

autoUpdater.logger = console;

const userHomeDir = app.getPath('home');

ipcMain.on('get-user-home-dir', event => {
  event.returnValue = userHomeDir;
});

/**
 * called by thunk to preview a kustomization
 */

ipcMain.on('run-kustomize', (event, folder: string) => {
  try {
    let stdout = execSync('kubectl kustomize ./', {
      cwd: folder,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PUBLIC_URL: process.env.PUBLIC_URL,
      },
    });

    event.sender.send('kustomize-result', {stdout: stdout.toString()});
  } catch (e) {
    event.sender.send('kustomize-result', {error: e.toString()});
  }
});

/**
 * called by thunk to preview a helm chart with values file
 */

ipcMain.on('run-helm', (event, args: any) => {
  try {
    let stdout = execSync(args.helmCommand, {
      cwd: args.cwd,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PUBLIC_URL: process.env.PUBLIC_URL,
        KUBECONFIG: args.kubeconfig,
      },
    });

    event.sender.send('helm-result', {stdout: stdout.toString()});
  } catch (e) {
    event.sender.send('helm-result', {error: e.toString()});
  }
});

ipcMain.on('app-version', (event, args) => {
  event.sender.send('app-version', {version: app.getVersion()});
});

ipcMain.on('quit-and-install', (event, args) => {
  console.info('quit-and-install-ipcMain');
  // autoUpdater.quitAndInstall();
});

function createWindow() {
  const image = nativeImage.createFromPath(path.join(app.getAppPath(), '/public/icon.ico'));
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: APP_MIN_WIDTH,
    minHeight: APP_MIN_HEIGHT,
    title: 'Monokle',
    icon: image,
    webPreferences: {
      webSecurity: false,
      contextIsolation: false,
      nodeIntegration: true, // <--- flag
      nodeIntegrationInWorker: true, // <---  for web workers
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:3000/index.html');
  } else {
    // 'build/index.html'
    win.loadURL(`file://${__dirname}/../index.html`);
  }

  // Hot Reloading
  if (isDev) {
    // eslint-disable-next-line global-require
    require('electron-reload')(__dirname, {
      electron: path.join(
        __dirname,
        '..',
        '..',
        'node_modules',
        '.bin',
        `electron${process.platform === 'win32' ? '.cmd' : ''}`
      ),
      forceHardReset: true,
      hardResetMethod: 'exit',
    });
  }

  if (isDev) {
    win.webContents.openDevTools();
  }

  win.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  autoUpdater.on('update-available', (info: any) => {
    console.log(`update-available-autoUpdater ${JSON.stringify(info)}`);
    win.webContents.send('update-available');
  });

  autoUpdater.on('download-progress', (progressObj: any) => {
    console.info(`download-progress-autoUpdater ${JSON.stringify(progressObj)}`);
  });

  autoUpdater.on('update-downloaded', (info: any) => {
    console.info(`update-available-autoUpdater ${JSON.stringify(info)}`);
    win.webContents.send('update-downloaded');
  });

  return win;
}

app.whenReady().then(() => {
  if (isDev) {
    // DevTools
    installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => console.log(`Added Extension:  ${name}`))
      .catch(err => console.log('An error occurred: ', err));

    installExtension(REDUX_DEVTOOLS)
      .then(name => console.log(`Added Extension:  ${name}`))
      .catch(err => console.log('An error occurred: ', err));
  }

  ElectronStore.initRenderer();
  createWindow();

  if (app.dock) {
    const image = nativeImage.createFromPath(path.join(app.getAppPath(), '/public/large-icon-256.png'));
    app.dock.setIcon(image);
  }

  console.info('info', app.getName(), app.getVersion(), app.getLocale());

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
});
