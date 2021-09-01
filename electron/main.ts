import {app, BrowserWindow, nativeImage, ipcMain} from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import installExtension, {REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS} from 'electron-devtools-installer';
import {execSync} from 'child_process';
import * as ElectronLog from 'electron-log';
import * as Splashscreen from '@trodi/electron-splashscreen';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

import {APP_MIN_HEIGHT, APP_MIN_WIDTH} from '../src/constants/constants';
import terminal from '../cli/terminal';

Object.assign(console, ElectronLog.functions);

const ElectronStore = require('electron-store');

const {MONOKLE_RUN_AS_NODE} = process.env;

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

function createWindow() {
  const image = nativeImage.createFromPath(path.join(app.getAppPath(), '/public/icon.ico'));
  const mainBrowserWindowOptions: Electron.BrowserWindowConstructorOptions = {
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
  };
  const splashscreenConfig: Splashscreen.Config = {
    windowOpts: mainBrowserWindowOptions,
    templateUrl: isDev
      ? path.normalize(`${__dirname}/../../public/Splashscreen.html`)
      : path.normalize(`${__dirname}/../Splashscreen.html`),
    delay: 0,
    splashScreenOpts: {
      width: 1200,
      height: 800,
      backgroundColor: 'black',
    },
  };

  const win: BrowserWindow = Splashscreen.initSplashScreen(splashscreenConfig);

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

  return win;
}

const openApplication = async (givenPath?: string) => {
  await app.whenReady();

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
  const win = createWindow();

  win.webContents.on('did-finish-load', () => {
    win.webContents.send('executed-from', {path: givenPath});
  });

  if (app.dock) {
    const image = nativeImage.createFromPath(path.join(app.getAppPath(), '/public/large-icon-256.png'));
    app.dock.setIcon(image);
  }

  console.log('info', app.getName(), app.getVersion(), app.getLocale(), givenPath);

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
};

if (MONOKLE_RUN_AS_NODE) {
  yargs(hideBin(process.argv)).command(
    '$0',
    'opens current directory',
    () => {},
    async argv => {
      const {executedFrom} = argv;
      openApplication(<string>executedFrom);
    }
  ).argv;
} else {
  openApplication();
}

terminal();
