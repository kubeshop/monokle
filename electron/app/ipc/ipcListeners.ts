import {app, ipcMain} from 'electron';

import asyncLib from 'async';
import log from 'loglevel';
import {machineIdSync} from 'node-machine-id';
import Nucleus from 'nucleus-nodejs';
import * as path from 'path';

import {
  DOWNLOAD_PLUGIN,
  DOWNLOAD_PLUGIN_RESULT,
  DOWNLOAD_TEMPLATE,
  DOWNLOAD_TEMPLATE_PACK,
  DOWNLOAD_TEMPLATE_PACK_RESULT,
  DOWNLOAD_TEMPLATE_RESULT,
  UPDATE_EXTENSIONS,
  UPDATE_EXTENSIONS_RESULT,
} from '@constants/ipcEvents';

import {NewVersionCode} from '@models/appconfig';
import {
  AnyExtension,
  DownloadPluginResult,
  DownloadTemplatePackResult,
  DownloadTemplateResult,
  UpdateExtensionsResult,
} from '@models/extension';
import {AnyPlugin} from '@models/plugin';
import {AnyTemplate, TemplatePack} from '@models/template';

import {changeCurrentProjectName, updateNewVersion} from '@redux/reducers/appConfig';
import {InterpolateTemplateOptions} from '@redux/services/templates';

import {FileExplorerOptions, FileOptions} from '@atoms/FileExplorer/FileExplorerOptions';

import {CommandOptions} from '@utils/command';
import {ProjectNameChange, StorePropagation} from '@utils/global-electron-store';
import {UPDATE_APPLICATION, trackEvent} from '@utils/telemetry';

import {getAmplitudeClient} from '../amplitude';
import autoUpdater from '../autoUpdater';
import {
  checkNewVersion,
  forceLoad as forceReload,
  interpolateTemplate,
  runCommand,
  saveFileDialog,
  selectFileDialog,
} from '../commands';
import {downloadPlugin, updatePlugin} from '../services/pluginService';
import {
  downloadTemplate,
  downloadTemplatePack,
  loadTemplatesFromPlugin,
  loadTemplatesFromTemplatePack,
  updateTemplate,
  updateTemplatePack,
} from '../services/templateService';
import {askActionConfirmation} from '../utils';
import {dispatchToAllWindows} from './ipcMainRedux';

const userHomeDir = app.getPath('home');
const userDataDir = app.getPath('userData');
const userTempDir = app.getPath('temp');
const pluginsDir = path.join(userDataDir, 'monoklePlugins');
const templatesDir = path.join(userDataDir, 'monokleTemplates');
const templatePacksDir = path.join(userDataDir, 'monokleTemplatePacks');
const machineId = machineIdSync();

ipcMain.on('track-event', async (event: any, {eventName, payload}: any) => {
  Nucleus.track(eventName, {...payload});
  const amplitudeClient = getAmplitudeClient();
  if (amplitudeClient) {
    amplitudeClient.logEvent({
      event_type: eventName,
      user_id: machineId,
      event_properties: payload,
    });
  }
});

ipcMain.on('get-user-home-dir', (event: any) => {
  event.returnValue = userHomeDir;
});

ipcMain.on(DOWNLOAD_PLUGIN, async (event: any, pluginUrl: string) => {
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

ipcMain.on(DOWNLOAD_TEMPLATE, async (event: any, templateUrl: string) => {
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

ipcMain.on(DOWNLOAD_TEMPLATE_PACK, async (event: any, templatePackUrl: string) => {
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

ipcMain.on(UPDATE_EXTENSIONS, async (event: any, payload: UpdateExtensionsPayload) => {
  const {templateMap, pluginMap, templatePackMap} = payload;
  let errorMessage = '';

  const standaloneTemplates = Object.entries(templateMap)
    .filter(([key]) => key.startsWith(templatesDir))
    .map(([_, value]) => value);

  const updatedStandaloneTemplateExtensions: (AnyExtension<AnyTemplate> | undefined)[] = await asyncLib.map(
    standaloneTemplates,
    async (template: AnyTemplate) => {
      try {
        const templateExtension = await updateTemplate(template, templatesDir, userTempDir);
        return templateExtension;
      } catch (e) {
        if (e instanceof Error) {
          errorMessage += `${e.message}\n`;
        }
      }
    }
  );

  const updatedPluginExtensions: (AnyExtension<AnyPlugin> | undefined)[] = await asyncLib.map(
    Object.values(pluginMap),
    async (plugin: AnyPlugin) => {
      try {
        const pluginExtension = await updatePlugin(plugin, pluginsDir, userTempDir);
        return pluginExtension;
      } catch (e) {
        if (e instanceof Error) {
          errorMessage += `${e.message}\n`;
        }
      }
    }
  );

  const updatedTemplatePackExtensions: (AnyExtension<TemplatePack> | undefined)[] = await asyncLib.map(
    Object.values(templatePackMap),
    async (templatePack: TemplatePack) => {
      try {
        const templatePackExtension = await updateTemplatePack(templatePack, templatePacksDir, userTempDir);
        return templatePackExtension;
      } catch (e) {
        if (e instanceof Error) {
          errorMessage += `${e.message}\n`;
        }
      }
    }
  );

  if (errorMessage.trim().length > 0) {
    log.warn('[Update Extensions]:', errorMessage);
  }

  const updateExtensionsResult: UpdateExtensionsResult = {
    pluginExtensions: updatedPluginExtensions.filter((x): x is AnyExtension<AnyPlugin> => x != null),
    templateExtensions: updatedStandaloneTemplateExtensions.filter((x): x is AnyExtension<AnyTemplate> => x != null),
    templatePackExtensions: updatedTemplatePackExtensions.filter((x): x is AnyExtension<TemplatePack> => x != null),
  };

  const updatedTemplateExtensionsFromPlugins: AnyExtension<AnyTemplate>[][] = await asyncLib.map(
    updateExtensionsResult.pluginExtensions,
    async (pluginExtension: AnyExtension<AnyPlugin>) => {
      const templateExtensions = await loadTemplatesFromPlugin(pluginExtension.extension);
      return templateExtensions;
    }
  );

  const updatedTemplateExtensionsFromTemplatePacks: AnyExtension<AnyTemplate>[][] = await asyncLib.map(
    updateExtensionsResult.templatePackExtensions,
    async (templatePackExtension: AnyExtension<TemplatePack>) => {
      const templateExtensions = await loadTemplatesFromTemplatePack(templatePackExtension.extension);
      return templateExtensions;
    }
  );

  updateExtensionsResult.templateExtensions.push(
    ...updatedTemplateExtensionsFromPlugins.flat(),
    ...updatedTemplateExtensionsFromTemplatePacks.flat()
  );

  event.sender.send(UPDATE_EXTENSIONS_RESULT, updateExtensionsResult);
});

ipcMain.on('interpolate-vanilla-template', (event: any, args: InterpolateTemplateOptions) => {
  interpolateTemplate(args, event);
});

ipcMain.handle('select-file', async (event, options: FileExplorerOptions) => {
  return selectFileDialog(event, options);
});

ipcMain.handle('save-file', async (event: any, options: FileOptions) => {
  return saveFileDialog(event, options);
});

ipcMain.on('run-command', (event, args: CommandOptions) => {
  runCommand(args, event);
});

ipcMain.on('app-version', event => {
  event.sender.send('app-version', {version: app.getVersion()});
});

ipcMain.on('check-update-available', async () => {
  await checkNewVersion(dispatchToAllWindows);
});

ipcMain.on('quit-and-install', () => {
  trackEvent(UPDATE_APPLICATION);
  autoUpdater.quitAndInstall();
  dispatchToAllWindows(updateNewVersion({code: NewVersionCode.Idle, data: null}));
});

ipcMain.on('force-reload', async (event: any) => {
  forceReload(event);
});

ipcMain.on('confirm-action', (event: any, args) => {
  event.returnValue = askActionConfirmation(args);
});

ipcMain.on('global-electron-store-update', (event, args: any) => {
  if (args.eventType === StorePropagation.ChangeProjectName) {
    const payload: ProjectNameChange = args.payload;
    dispatchToAllWindows(changeCurrentProjectName(payload.newName));
  } else {
    log.warn(`received invalid event type for global electron store update ${args.eventType}`);
  }
});
