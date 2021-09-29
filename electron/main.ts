/* eslint-disable import/order */
/* eslint-disable import/first */
import moduleAlias from 'module-alias';
import * as ElectronLog from 'electron-log';

Object.assign(console, ElectronLog.functions);
moduleAlias.addAliases({
  '@constants': `${__dirname}/../src/constants`,
  '@models': `${__dirname}/../src/models`,
  '@redux': `${__dirname}/../src/redux`,
  '@utils': `${__dirname}/../src/utils`,
  '@src': `${__dirname}/../src/`,
  '@root': `${__dirname}/../`,
});

try {
  // eslint-disable-next-line global-require
  const {env} = require('./env');
  process.env.NODE_ENV = !env || env === 'production' ? 'production' : 'development';
} catch (error) {
  process.env.NODE_ENV = 'production';
}

import {app, BrowserWindow, nativeImage, ipcMain, dialog} from 'electron';
import * as path from 'path';
import installExtension, {REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS} from 'electron-devtools-installer';
import {execSync} from 'child_process';
import * as Splashscreen from '@trodi/electron-splashscreen';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {APP_MIN_HEIGHT, APP_MIN_WIDTH} from '@constants/constants';
import {checkMissingDependencies} from '@utils/index';
import ElectronStore from 'electron-store';
import {autoUpdater} from 'electron-updater';
import mainStore from '@redux/main-store';
import {updateNewVersion} from '@redux/reducers/appConfig';
import {NewVersion} from '@models/appconfig';

import {createMenu, getDockMenu} from './menu';
import terminal from '../cli/terminal';

Object.assign(console, ElectronLog.functions);
autoUpdater.logger = console;

const {MONOKLE_RUN_AS_NODE} = process.env;

const isDev = process.env.NODE_ENV === 'development';

const userHomeDir = app.getPath('home');
const APP_DEPENDENCIES = ['kubectl', 'helm'];

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
  } catch (e: any) {
    event.sender.send('kustomize-result', {error: e.toString()});
  }
});

ipcMain.on('check-missing-dependency', event => {
  const missingDependecies = checkMissingDependencies(APP_DEPENDENCIES);
  if (missingDependecies.length > 0) {
    event.sender.send('missing-dependency-result', {dependencies: missingDependecies});
  }
});

ipcMain.handle('select-file', async (event, options: any) => {
  const browserWindow = BrowserWindow.fromId(event.sender.id);
  let dialogOptions: Electron.OpenDialogSyncOptions = {};
  if (options.isDirectoryExplorer) {
    dialogOptions.properties = ['openDirectory'];
  } else {
    if (options.allowMultiple) {
      dialogOptions.properties = ['multiSelections'];
    }
    if (options.acceptedFileExtensions) {
      dialogOptions.filters = [{name: 'Files', extensions: options.acceptedFileExtensions}];
    }
  }

  if (browserWindow) {
    return dialog.showOpenDialogSync(browserWindow, dialogOptions);
  }
  return dialog.showOpenDialogSync(dialogOptions);
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
  } catch (e: any) {
    event.sender.send('helm-result', {error: e.toString()});
  }
});

ipcMain.on('app-version', event => {
  event.sender.send('app-version', {version: app.getVersion()});
});

ipcMain.on('check-update-available', async () => {
  await checkNewVersion();
});

ipcMain.on('quit-and-install', () => {
  autoUpdater.quitAndInstall();
});

export const checkNewVersion = async () => {
  try {
    mainStore.dispatch(updateNewVersion(NewVersion.Checking));
    await autoUpdater.checkForUpdates();
  } catch (error) {
    mainStore.dispatch(updateNewVersion(NewVersion.Errored));
  }
};

export const createWindow = (givenPath?: string) => {
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
      enableRemoteModule: true,
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

  autoUpdater.on('update-available', () => {
    mainStore.dispatch(updateNewVersion(NewVersion.Available));
  });

  autoUpdater.on('update-not-available', () => {
    mainStore.dispatch(updateNewVersion(NewVersion.NotAvailable));
  });

  autoUpdater.on('download-progress', (progressObj: any) => {
    console.info(`download-progress ${JSON.stringify(progressObj)}`);
    mainStore.dispatch(updateNewVersion(NewVersion.Downloading));
  });

  autoUpdater.on('update-downloaded', () => {
    mainStore.dispatch(updateNewVersion(NewVersion.Downloaded));
  });

  const missingDependecies = checkMissingDependencies(APP_DEPENDENCIES);

  if (missingDependecies.length > 0) {
    win.webContents.on('did-finish-load', () => {
      win.webContents.send('missing-dependency-result', {dependencies: missingDependecies});
    });
  }

  win.webContents.on('did-finish-load', () => {
    win.webContents.send('executed-from', {path: givenPath});
  });

  return win;
};

export const openApplication = async (givenPath?: string) => {
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
  createWindow(givenPath);

  mainStore.subscribe(() => {
    createMenu(mainStore);
  });

  if (app.dock) {
    const image = nativeImage.createFromPath(path.join(app.getAppPath(), '/public/large-icon-256.png'));
    app.dock.setIcon(image);
    mainStore.subscribe(() => {
      app.dock.setMenu(getDockMenu(mainStore));
    });
  }

  console.log('info', app.getName(), app.getVersion(), app.getLocale(), givenPath);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(givenPath);
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

terminal()
  // eslint-disable-next-line no-console
  .catch(e => console.log(e));
