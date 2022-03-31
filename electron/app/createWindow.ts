import {BrowserWindow, app, nativeImage} from 'electron';

import {indexOf} from 'lodash';
import Nucleus from 'nucleus-nodejs';
import * as path from 'path';

import {
  APP_MIN_HEIGHT,
  APP_MIN_WIDTH,
  DEFAULT_PLUGINS,
  DEFAULT_TEMPLATES_PLUGIN_URL,
  DEPENDENCIES_HELP_URL,
} from '@constants/constants';

import {AlertEnum, AlertType} from '@models/alert';
import {NewVersionCode} from '@models/appconfig';

import {setAlert} from '@redux/reducers/alert';
import {setUserDirs, updateNewVersion} from '@redux/reducers/appConfig';
import {setExtensionsDirs, setPluginMap, setTemplateMap, setTemplatePackMap} from '@redux/reducers/extension';
import {setAppRehydrating} from '@redux/reducers/main';
import {activeProjectSelector, unsavedResourcesSelector} from '@redux/selectors';

import utilsElectronStore from '@utils/electronStore';
import {fixPath} from '@utils/path';
import {StartupFlags} from '@utils/startupFlag';

import * as Splashscreen from '@trodi/electron-splashscreen';

import autoUpdater from './autoUpdater';
import {checkNewVersion} from './commands';
import initKubeconfig from './initKubeconfig';
import {
  createDispatchForWindow,
  dispatchToAllWindows,
  dispatchToWindow,
  subscribeToStoreStateChanges,
} from './ipc/ipcMainRedux';
import {createMenu} from './menu';
import {downloadPlugin, loadPluginMap} from './services/pluginService';
import {loadTemplateMap, loadTemplatePackMap} from './services/templateService';
import {setWindowTitle} from './setWindowTitle';
import {
  askActionConfirmation,
  checkMissingDependencies,
  convertRecentFilesToRecentProjects,
  getSerializedProcessEnv,
} from './utils';

const isDev = process.env.NODE_ENV === 'development';

const userHomeDir = app.getPath('home');
const userDataDir = app.getPath('userData');
const userTempDir = app.getPath('temp');
const pluginsDir = path.join(userDataDir, 'monoklePlugins');
const templatesDir = path.join(userDataDir, 'monokleTemplates');
const templatePacksDir = path.join(userDataDir, 'monokleTemplatePacks');
const APP_DEPENDENCIES = ['kubectl', 'helm', 'kustomize'];

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
      ? path.normalize(`${__dirname}/../../../public/Splashscreen.html`)
      : path.normalize(`${__dirname}/../../Splashscreen.html`),
    delay: 0,
    splashScreenOpts: {
      width: 1200,
      height: 800,
      backgroundColor: 'black',
    },
  };

  const win: BrowserWindow = Splashscreen.initSplashScreen(splashscreenConfig);
  let unsavedResourceCount = 0;

  fixPath();

  if (isDev) {
    win.loadURL('http://localhost:3000/index.html');
  } else {
    // 'build/index.html'
    win.loadURL(`file://${__dirname}/../../index.html`);
  }

  // Hot Reloading
  if (isDev) {
    // eslint-disable-next-line global-require
    require('electron-reload')(__dirname, {
      electron: path.join(
        __dirname,
        '..',
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

    Nucleus.appStarted();

    subscribeToStoreStateChanges(win.webContents, storeState => {
      createMenu(storeState, dispatch);
      let projectName = activeProjectSelector(storeState)?.name;
      setWindowTitle(storeState, win, projectName);
      unsavedResourceCount = unsavedResourcesSelector(storeState).length;

      // disableTracking = storeState.config.disableEventTracking;
      // disableErrorReports = storeState.config.disableErrorReporting;
      if (storeState.config.disableEventTracking) {
        Nucleus.disableTracking();
      } else {
        Nucleus.enableTracking();
      }
    });

    dispatch(setAppRehydrating(true));
    if (process.argv.includes(StartupFlags.AUTOMATION)) {
      win.webContents.send('set-automation');
    }

    dispatch(
      setUserDirs({
        homeDir: userHomeDir,
        tempDir: userTempDir,
        dataDir: userDataDir,
      })
    );
    dispatch(
      setExtensionsDirs({
        templatesDir,
        templatePacksDir,
        pluginsDir,
      })
    );

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
        message: `${missingDependencies.toString()} must be installed for all Monokle functionality to be available.
        [Read more](${DEPENDENCIES_HELP_URL})`,
      };
      dispatchToWindow(win, setAlert(alert));
    }
    win.webContents.send('executed-from', {path: givenPath});
    win.webContents.send('set-main-process-env', {serializedMainProcessEnv: getSerializedProcessEnv()});

    const pluginMap = await loadPluginMap(pluginsDir);
    const uniquePluginNames = Object.values(pluginMap).map(
      plugin => `${plugin.repository.owner}-${plugin.repository.name}`
    );

    const hasDeletedDefaultTemplatesPlugin = Boolean(
      utilsElectronStore.get('appConfig.hasDeletedDefaultTemplatesPlugin')
    );
    const defaultPluginsToLoad = DEFAULT_PLUGINS.filter(defaultPlugin => {
      if (hasDeletedDefaultTemplatesPlugin && defaultPlugin.url === DEFAULT_TEMPLATES_PLUGIN_URL) {
        return false;
      }
      return !uniquePluginNames.includes(`${defaultPlugin.owner}-${defaultPlugin.name}`);
    });

    const downloadedPlugins = await Promise.all(
      defaultPluginsToLoad.map(defaultPlugin => downloadPlugin(defaultPlugin.url, pluginsDir))
    );
    downloadedPlugins.forEach(downloadedPlugin => {
      pluginMap[downloadedPlugin.folderPath] = downloadedPlugin.extension;
    });
    const templatePackMap = await loadTemplatePackMap(templatePacksDir);
    const templateMap = await loadTemplateMap(templatesDir, {
      plugins: Object.values(pluginMap),
      templatePacks: Object.values(templatePackMap),
    });

    dispatch(setPluginMap(pluginMap));
    dispatch(setTemplatePackMap(templatePackMap));
    dispatch(setTemplateMap(templateMap));
    convertRecentFilesToRecentProjects(dispatch);
  });

  win.on('close', e => {
    const confirmed = askActionConfirmation({
      unsavedResourceCount,
      action: 'close this window',
    });

    if (!confirmed) {
      e.preventDefault();
    }
  });

  return win;
};
