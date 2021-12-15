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

import {app, BrowserWindow, nativeImage, ipcMain} from 'electron';
import * as path from 'path';
import installExtension, {REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS} from 'electron-devtools-installer';
import * as Splashscreen from '@trodi/electron-splashscreen';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {APP_MIN_HEIGHT, APP_MIN_WIDTH, ROOT_FILE_ENTRY} from '@constants/constants';
import {DOWNLOAD_PLUGIN, DOWNLOAD_PLUGIN_RESULT} from '@constants/ipcEvents';
import {checkMissingDependencies} from '@utils/index';
import ElectronStore from 'electron-store';
import {setUserDirs, updateNewVersion} from '@redux/reducers/appConfig';
import {NewVersionCode} from '@models/appconfig';
import {K8sResource} from '@models/k8sresource';
import {isInPreviewModeSelector} from '@redux/selectors';
import {HelmChart, HelmValuesFile} from '@models/helm';
import log from 'loglevel';
import {PROCESS_ENV} from '@utils/env';

import {createMenu, getDockMenu} from './menu';
import initKubeconfig from './src/initKubeconfig';
import terminal from '../cli/terminal';
import {downloadPlugin, loadPlugins} from './pluginService';
import {AlertEnum, AlertType} from '@models/alert';
import {setAlert} from '@redux/reducers/alert';
import {checkNewVersion, runHelm, runKustomize, saveFileDialog, selectFileDialog} from '@root/electron/commands';
import {setAppRehydrating} from '@redux/reducers/main';
import {setPlugins} from '@redux/reducers/contrib';
import autoUpdater from './auto-update';
import { indexOf } from 'lodash';
import {FileExplorerOptions, FileOptions} from '@atoms/FileExplorer/FileExplorerOptions';
import { createDispatchForWindow, dispatchToAllWindows, dispatchToWindow, subscribeToStoreStateChanges } from './ipcMainRedux';
import { RootState } from '@redux/store';

Object.assign(console, ElectronLog.functions);

const {MONOKLE_RUN_AS_NODE} = process.env;

const isDev = PROCESS_ENV.NODE_ENV === 'development';

const userHomeDir = app.getPath('home');
const userDataDir = app.getPath('userData');
const userTempDir = app.getPath('temp');
const pluginsDir = path.join(userDataDir, 'monoklePlugins');
const APP_DEPENDENCIES = ['kubectl', 'helm', 'kustomize'];

ipcMain.on('get-user-home-dir', event => {
  event.returnValue = userHomeDir;
});

ipcMain.on(DOWNLOAD_PLUGIN, async (event, pluginUrl: string) => {
  try {
    const plugin = await downloadPlugin(pluginUrl, pluginsDir);
    event.sender.send(DOWNLOAD_PLUGIN_RESULT, plugin);
  } catch (err) {
    if (err instanceof Error) {
      event.sender.send(DOWNLOAD_PLUGIN_RESULT, err);
    } else {
      log.warn(err);
    }
  }
});

ipcMain.on('run-kustomize', (event, cmdOptions: any) => {
  runKustomize(cmdOptions.folder, cmdOptions.kustomizeCommand, event);
});

ipcMain.handle('select-file', async (event, options: FileExplorerOptions) => {
  return selectFileDialog(event, options);
});

ipcMain.handle('save-file', async (event, options: FileOptions) => {
  return saveFileDialog(event, options);
});

ipcMain.on('run-helm', (event, args: any) => {
  runHelm(args, event);
});

ipcMain.on('app-version', event => {
  event.sender.send('app-version', {version: app.getVersion()});
});

ipcMain.on('check-update-available', async () => {
  await checkNewVersion(dispatchToAllWindows);
});

ipcMain.on('quit-and-install', () => {
  autoUpdater.quitAndInstall();
  dispatchToAllWindows(updateNewVersion({code: NewVersionCode.Idle, data: null}));
});

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

  autoUpdater.on('update-available', (data: any) => {
    dispatchToAllWindows(updateNewVersion({code: NewVersionCode.Available, data: null}));
  });

  autoUpdater.on('update-not-available', (data: any) => {
    dispatchToAllWindows(updateNewVersion({code: NewVersionCode.NotAvailable, data: null}));
  });

  autoUpdater.on('download-progress', (progressObj: any) => {
    let percent = 0;
    if (progressObj && progressObj.percent) {
      percent = progressObj.percent;
    }
    dispatchToAllWindows(updateNewVersion({code: NewVersionCode.Downloading, data: {percent: percent.toFixed(2)}}));
  });

  autoUpdater.on('update-downloaded', (data: any) => {
    dispatchToAllWindows(updateNewVersion({code: NewVersionCode.Downloaded, data: null}));
  });

  win.webContents.on('dom-ready', async () => {
    const dispatch = createDispatchForWindow(win);

    subscribeToStoreStateChanges(win.webContents, (storeState) => {
      createMenu(storeState, dispatch);
      setWindowTitle(storeState, win);
    });

    dispatch(setAppRehydrating(true));
    dispatch(setUserDirs({
      homeDir: userHomeDir,
      tempDir: userTempDir,
      dataDir: userDataDir
    }));
    await checkNewVersion(dispatch, true);
    initKubeconfig(dispatch, userHomeDir);
    dispatch(setAppRehydrating(false));

    const missingDependencies = checkMissingDependencies(APP_DEPENDENCIES);
    const isUserAbleToRunKubectlKustomize = checkMissingDependencies(['kubectl kustomize --help']);

    if (missingDependencies.includes('kustomize') && isUserAbleToRunKubectlKustomize) {
      missingDependencies.splice(indexOf(missingDependencies, 'kustomize'), 1);

    }

    if (missingDependencies.length > 0) {
      const alert: AlertType = {
        type: AlertEnum.Warning,
        title: 'Missing dependency',
        message: `${missingDependencies.toString()} must be installed for all Monokle functionality to be available`,
      };
      dispatchToWindow(win, setAlert(alert));
    }
    win.webContents.send('executed-from', {path: givenPath});

    loadPlugins(pluginsDir).then(plugins => {
      dispatch(setPlugins(plugins));
    });
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
  const win = createWindow(givenPath);


  if (app.dock) {
    const image = nativeImage.createFromPath(path.join(app.getAppPath(), '/public/large-icon-256.png'));
    app.dock.setIcon(image);
    app.dock.setMenu(getDockMenu());
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

export const setWindowTitle = (state: RootState, window: BrowserWindow) => {
  if (window.isDestroyed()) {
    return;
  }
  const isInPreviewMode = isInPreviewModeSelector(state);
  const previewType = state.main.previewType;
  const previewResourceId = state.main.previewResourceId;
  const resourceMap = state.main.resourceMap;
  const previewValuesFileId = state.main.previewValuesFileId;
  const helmValuesMap = state.main.helmValuesMap;
  const helmChartMap = state.main.helmChartMap;
  const fileMap = state.main.fileMap;

  let previewResource: K8sResource | undefined;
  let previewValuesFile: HelmValuesFile | undefined;
  let helmChart: HelmChart | undefined;

  if (previewResourceId) {
    previewResource = resourceMap[previewResourceId];
  }

  if (previewValuesFileId && helmValuesMap[previewValuesFileId]) {
    const valuesFile = helmValuesMap[previewValuesFileId];
    previewValuesFile = valuesFile;
    helmChart = helmChartMap[valuesFile.helmChartId];
  }

  let windowTitle = 'Monokle';

  if (isInPreviewMode && previewType === 'kustomization') {
    windowTitle = previewResource ? `Monokle - previewing [${previewResource.name}] kustomization` : `Monokle`;
    window.setTitle(windowTitle);
    return;
  }
  if (isInPreviewMode && previewType === 'cluster') {
    windowTitle = `Monokle - previewing context [${  String(state.config.kubeConfig.currentContext)  }]` || 'Monokle';
    window.setTitle(windowTitle);
    return;
  }
  if (isInPreviewMode && previewType === 'helm') {
    windowTitle = `Monokle - previewing ${previewValuesFile?.name} for ${helmChart?.name} Helm chart`;
    window.setTitle(windowTitle);
    return;
  }
  if (fileMap && fileMap[ROOT_FILE_ENTRY] && fileMap[ROOT_FILE_ENTRY].filePath) {
    windowTitle = fileMap[ROOT_FILE_ENTRY].filePath;
    window.setTitle(`Monokle - ${windowTitle}`);
    return;
  }
  window.setTitle(windowTitle);
};
