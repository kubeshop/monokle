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
import {APP_MIN_HEIGHT, APP_MIN_WIDTH, DEFAULT_PLUGINS, ROOT_FILE_ENTRY} from '@constants/constants';
import {DOWNLOAD_PLUGIN, DOWNLOAD_PLUGIN_RESULT, DOWNLOAD_TEMPLATE, DOWNLOAD_TEMPLATE_RESULT, DOWNLOAD_TEMPLATE_PACK, DOWNLOAD_TEMPLATE_PACK_RESULT, UPDATE_EXTENSIONS, UPDATE_EXTENSIONS_RESULT} from '@constants/ipcEvents';
import {checkMissingDependencies} from '@utils/index';
import ElectronStore from 'electron-store';
import {setUserDirs, updateNewVersion} from '@redux/reducers/appConfig';
import {NewVersionCode} from '@models/appconfig';
import {K8sResource} from '@models/k8sresource';
import {isInPreviewModeSelector, kubeConfigContextSelector} from '@redux/selectors';
import {HelmChart, HelmValuesFile} from '@models/helm';
import log from 'loglevel';
import {PROCESS_ENV} from '@utils/env';
import asyncLib from "async";

import {createMenu, getDockMenu} from './menu';
import initKubeconfig from './src/initKubeconfig';
import terminal from '../cli/terminal';
import {downloadPlugin, loadPluginMap, updatePlugin} from './pluginService';
import {AlertEnum, AlertType} from '@models/alert';
import {setAlert} from '@redux/reducers/alert';
import {checkNewVersion, runHelm, runKustomize, saveFileDialog, selectFileDialog} from '@root/electron/commands';
import {setAppRehydrating} from '@redux/reducers/main';
import {setPluginMap, setTemplatePackMap, setTemplateMap, setExtensionsDirs} from '@redux/reducers/extension';
import autoUpdater from './auto-update';
import {indexOf} from 'lodash';
import {FileExplorerOptions, FileOptions} from '@atoms/FileExplorer/FileExplorerOptions';
import {createDispatchForWindow, dispatchToAllWindows, dispatchToWindow, subscribeToStoreStateChanges} from './ipcMainRedux';
import {RootState} from '@models/rootstate';
import {downloadTemplate, downloadTemplatePack, loadTemplatePackMap, loadTemplateMap, loadTemplatesFromPlugin, loadTemplatesFromTemplatePack, updateTemplate, updateTemplatePack} from './templateService';
import {AnyTemplate, TemplatePack} from '@models/template';
import {AnyPlugin} from '@models/plugin';
import {AnyExtension, DownloadPluginResult, DownloadTemplatePackResult, DownloadTemplateResult, UpdateExtensionsResult} from '@models/extension';
import {KustomizeCommandOptions} from '@redux/thunks/previewKustomization';
import { convertRecentFilesToRecentProjects } from './utils';

Object.assign(console, ElectronLog.functions);

const {MONOKLE_RUN_AS_NODE} = process.env;

const isDev = PROCESS_ENV.NODE_ENV === 'development';

const userHomeDir = app.getPath('home');
const userDataDir = app.getPath('userData');
const userTempDir = app.getPath('temp');
const pluginsDir = path.join(userDataDir, 'monoklePlugins');
const templatesDir = path.join(userDataDir, 'monokleTemplates');
const templatePacksDir = path.join(userDataDir, 'monokleTemplatePacks');
const APP_DEPENDENCIES = ['kubectl', 'helm', 'kustomize'];

ipcMain.on('get-user-home-dir', event => {
  event.returnValue = userHomeDir;
});


ipcMain.on(DOWNLOAD_PLUGIN, async (event, pluginUrl: string) => {
  try {
    const pluginExtension = await downloadPlugin(pluginUrl, pluginsDir);
    const templateExtensions = await loadTemplatesFromPlugin(pluginExtension.extension);
    const downloadPluginResult: DownloadPluginResult = {pluginExtension, templateExtensions};
    event.sender.send(DOWNLOAD_PLUGIN_RESULT, downloadPluginResult);
  } catch (err) {
    if (err instanceof Error) {
      event.sender.send(DOWNLOAD_PLUGIN_RESULT, err);
    } else {
      log.warn(err);
    }
  }
});

ipcMain.on(DOWNLOAD_TEMPLATE, async (event, templateUrl: string) => {
  try {
    const templateExtension = await downloadTemplate(templateUrl, templatesDir);
    const downloadTemplateResult: DownloadTemplateResult = {templateExtension};
    event.sender.send(DOWNLOAD_TEMPLATE_RESULT, downloadTemplateResult);
  } catch (err) {
    if (err instanceof Error) {
      event.sender.send(DOWNLOAD_TEMPLATE_RESULT, err);
    } else {
      log.warn(err);
    }
  }
});

ipcMain.on(DOWNLOAD_TEMPLATE_PACK, async (event, templatePackUrl: string) => {
  try {
    const templatePackExtension = await downloadTemplatePack(templatePackUrl, templatePacksDir);
    const templateExtensions = await loadTemplatesFromTemplatePack(templatePackExtension.extension);
    const downloadTemplatePackResult: DownloadTemplatePackResult = {templatePackExtension, templateExtensions};
    event.sender.send(DOWNLOAD_TEMPLATE_PACK_RESULT, downloadTemplatePackResult);
  } catch (err) {
    if (err instanceof Error) {
      event.sender.send(DOWNLOAD_TEMPLATE_PACK_RESULT, err);
    } else {
      log.warn(err);
    }
  }
});

type UpdateExtensionsPayload = {
  templateMap: Record<string, AnyTemplate>;
  templatePackMap: Record<string, TemplatePack>;
  pluginMap: Record<string, AnyPlugin>;
};

ipcMain.on(UPDATE_EXTENSIONS, async (event, payload: UpdateExtensionsPayload) => {
  const {templateMap, pluginMap, templatePackMap} = payload;
  let errorMessage = '';

  const standaloneTemplates = Object.entries(templateMap).filter(
    ([key]) => key.startsWith(templatesDir)
  ).map(([_, value]) => value);

  const updatedStandaloneTemplateExtensions: (AnyExtension<AnyTemplate> | undefined)[] = await asyncLib.map(standaloneTemplates, async (template: AnyTemplate) => {
    try {
      const templateExtension = await updateTemplate(template, templatesDir, userTempDir);
      return templateExtension;
    }
    catch(e) {
      if (e instanceof Error) {
        errorMessage += `${e.message}\n`;
      }
    }
  });

  const updatedPluginExtensions: (AnyExtension<AnyPlugin> | undefined)[] = await asyncLib.map(Object.values(pluginMap), async (plugin: AnyPlugin) => {
    try {
      const pluginExtension = await updatePlugin(plugin, pluginsDir, userTempDir);
      return pluginExtension;
    } catch(e) {
      if (e instanceof Error) {
        errorMessage += `${e.message}\n`;
      }
    }
  });

  const updatedTemplatePackExtensions: (AnyExtension<TemplatePack> | undefined)[] = await asyncLib.map(Object.values(templatePackMap), async (templatePack: TemplatePack) => {
    try {
      const templatePackExtension = await updateTemplatePack(templatePack, templatePacksDir, userTempDir);
      return templatePackExtension;
    } catch(e) {
      if (e instanceof Error) {
        errorMessage += `${e.message}\n`;
      }
    }
  });

  if (errorMessage.trim().length > 0) {
    log.warn("[Update Extensions]:", errorMessage);
  }

  const updateExtensionsResult: UpdateExtensionsResult = {
    pluginExtensions: updatedPluginExtensions.filter((x): x is AnyExtension<AnyPlugin> => x != null),
    templateExtensions: updatedStandaloneTemplateExtensions.filter((x): x is AnyExtension<AnyTemplate> => x != null),
    templatePackExtensions: updatedTemplatePackExtensions.filter((x): x is AnyExtension<TemplatePack> => x != null),
  };

  const updatedTemplateExtensionsFromPlugins: AnyExtension<AnyTemplate>[][] = await asyncLib.map(
    updateExtensionsResult.pluginExtensions,
    async (pluginExtension: AnyExtension<AnyPlugin>
  ) => {
    const templateExtensions = await loadTemplatesFromPlugin(pluginExtension.extension);
    return templateExtensions;
  });

  const updatedTemplateExtensionsFromTemplatePacks: AnyExtension<AnyTemplate>[][] = await asyncLib.map(
    updateExtensionsResult.templatePackExtensions,
    async (templatePackExtension: AnyExtension<TemplatePack>
  ) => {
    const templateExtensions = await loadTemplatesFromTemplatePack(templatePackExtension.extension);
    return templateExtensions;
  });

  updateExtensionsResult.templateExtensions.push(...updatedTemplateExtensionsFromPlugins.flat(), ...updatedTemplateExtensionsFromTemplatePacks.flat());

  event.sender.send(UPDATE_EXTENSIONS_RESULT, updateExtensionsResult);
});

ipcMain.on('run-kustomize', (event, cmdOptions: KustomizeCommandOptions) => {
  runKustomize(cmdOptions, event);
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
    dispatch(setExtensionsDirs({
      templatesDir,
      templatePacksDir,
      pluginsDir
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

    const pluginMap = await loadPluginMap(pluginsDir);
    const pluginRepoNames = Object.values(pluginMap).map((plugin) => plugin.repository.name);

    const defaultPluginsToLoad = DEFAULT_PLUGINS.filter((defaultPlugin) => {
      return !pluginRepoNames.includes(defaultPlugin.name);
    });

    const downloadedPlugins = await Promise.all(defaultPluginsToLoad
      .map((defaultPlugin) => downloadPlugin(defaultPlugin.url, pluginsDir)));
    downloadedPlugins.forEach((downloadedPlugin) => {
      pluginMap[downloadedPlugin.folderPath] = downloadedPlugin.extension;
    });
    const templatePackMap = await loadTemplatePackMap(templatePacksDir);
    const templateMap = await loadTemplateMap(templatesDir, {plugins: Object.values(pluginMap), templatePacks: Object.values(templatePackMap)});

    dispatch(setPluginMap(pluginMap));
    dispatch(setTemplatePackMap(templatePackMap));
    dispatch(setTemplateMap(templateMap));

    convertRecentFilesToRecentProjects(dispatch);

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

terminal().catch(e => log.error(e));

export const setWindowTitle = (state: RootState, window: BrowserWindow) => {
  if (window.isDestroyed()) {
    return;
  }
  const isInPreviewMode = isInPreviewModeSelector(state);
  const kubeConfigContext = kubeConfigContextSelector(state);
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
    windowTitle = `Monokle - previewing context [${ kubeConfigContext  }]` || 'Monokle';
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
