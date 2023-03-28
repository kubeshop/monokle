import {BrowserWindow, app, nativeImage} from 'electron';

import indexOf from 'lodash/indexOf';
import {machineIdSync} from 'node-machine-id';
import * as path from 'path';

import {APP_MIN_HEIGHT, APP_MIN_WIDTH, NEW_VERSION_CHECK_INTERVAL} from '@shared/constants/app';
import {DEFAULT_PLUGINS} from '@shared/constants/plugin';
import {DEFAULT_TEMPLATES_PLUGIN_URL, DEPENDENCIES_HELP_URL} from '@shared/constants/urls';
import {AlertEnum} from '@shared/models/alert';
import type {AlertType} from '@shared/models/alert';
import {NewVersionCode} from '@shared/models/config';
import {StartupFlags} from '@shared/models/startupFlag';
import {DISABLED_TELEMETRY} from '@shared/models/telemetry';
import utilsElectronStore from '@shared/utils/electronStore';
import {disableSegment, enableSegment, getSegmentClient} from '@shared/utils/segment';
import {activeProjectSelector, transientResourceCountSelector} from '@shared/utils/selectors';
import * as Splashscreen from '@trodi/electron-splashscreen';

import autoUpdater from './autoUpdater';
import {checkNewVersion} from './commands';
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
const crdsDir = path.join(userDataDir, 'savedCRDs');
const templatePacksDir = path.join(userDataDir, 'monokleTemplatePacks');
const APP_DEPENDENCIES = ['kubectl', 'helm', 'kustomize', 'git'];
const machineId = machineIdSync();

export const createWindow = (givenPath?: string) => {
  const iconPath = isDev ? path.join('resources', 'icon.ico') : path.join(process.resourcesPath, 'icon.ico');
  const image = nativeImage.createFromPath(iconPath);
  const mainBrowserWindowOptions: Electron.BrowserWindowConstructorOptions = {
    width: 1200,
    height: 800,
    minWidth: APP_MIN_WIDTH,
    minHeight: APP_MIN_HEIGHT,
    title: 'Monokle',
    icon: image,
    webPreferences: {
      zoomFactor: utilsElectronStore.get('ui.zoomFactor'),
      webSecurity: false,
      contextIsolation: false,
      nodeIntegration: true, // <--- flag
      nodeIntegrationInWorker: true, // <---  for web workers
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

  autoUpdater.on('update-available', () => {
    dispatchToAllWindows({type: 'config/updateNewVersion', payload: {code: NewVersionCode.Available, data: null}});
  });

  autoUpdater.on('update-not-available', () => {
    dispatchToAllWindows({type: 'config/updateNewVersion', payload: {code: NewVersionCode.NotAvailable, data: null}});
  });

  autoUpdater.on('download-progress', (progressObj: any) => {
    let percent = 0;
    if (progressObj && progressObj.percent) {
      percent = progressObj.percent;
    }
    dispatchToAllWindows({
      type: 'config/updateNewVersion',
      payload: {code: NewVersionCode.Downloading, data: {percent: percent.toFixed(2)}},
    });
  });

  autoUpdater.on('update-downloaded', () => {
    dispatchToAllWindows({type: 'config/updateNewVersion', payload: {code: NewVersionCode.Downloaded, data: null}});
  });

  win.webContents.on('certificate-error', (event, url, error, certificate, callback) => {
    event.preventDefault();
    callback(true);
  });

  win.webContents.on('dom-ready', async () => {
    if (isDev) {
      win.webContents.openDevTools();
    }

    const dispatch = createDispatchForWindow(win);

    subscribeToStoreStateChanges(win.webContents, storeState => {
      createMenu(storeState, dispatch);
      let projectName = activeProjectSelector(storeState)?.name;
      setWindowTitle(storeState, win, projectName);
      unsavedResourceCount = transientResourceCountSelector(storeState);
      const segmentClient = getSegmentClient();

      if (storeState.config.disableEventTracking) {
        segmentClient?.track({
          userId: machineId,
          event: DISABLED_TELEMETRY,
        });
        disableSegment();
      } else {
        enableSegment();
      }
    });

    dispatch({type: 'main/setAppRehydrating', payload: true});

    if (process.argv.includes(StartupFlags.AUTOMATION)) {
      win.webContents.send('set-automation');
    }

    dispatch({
      type: 'config/setUserDirs',
      payload: {
        homeDir: userHomeDir,
        tempDir: userTempDir,
        dataDir: userDataDir,
        crdsDir,
      },
    });

    dispatch({
      type: 'extension/setExtensionsDirs',
      payload: {
        templatesDir,
        templatePacksDir,
        pluginsDir,
      },
    });

    if (process.env.SENTRY_DSN) {
      const SENTRY_DSN = process.env.SENTRY_DSN;
      if (typeof SENTRY_DSN === 'string' && SENTRY_DSN.trim().length) {
        dispatch({type: 'config/initRendererSentry', payload: {SENTRY_DSN}});
      }
    }

    await checkNewVersion(dispatch, true);
    setInterval(async () => {
      await checkNewVersion(dispatch, true);
    }, NEW_VERSION_CHECK_INTERVAL);

    dispatch({type: 'main/setAppRehydrating', payload: false});

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
      dispatchToWindow(win, {type: 'alert/setAlert', payload: alert});
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

    dispatch({type: 'extension/setPluginMap', payload: pluginMap});
    dispatch({type: 'extension/setTemplatePackMap', payload: templatePackMap});
    dispatch({type: 'extension/setTemplateMap', payload: templateMap});
    dispatch({type: 'terminal/setWebContentsId', payload: win.webContents.id});
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
