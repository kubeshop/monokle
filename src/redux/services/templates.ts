/* eslint-disable no-restricted-syntax */
import {ipcRenderer} from 'electron';

import asyncLib from 'async';
import fs from 'fs';
import log from 'loglevel';

import {DEFAULT_TEMPLATES_PLUGIN_URL} from '@constants/constants';

import {AlertEnum, AlertType} from '@models/alert';
import {AppDispatch} from '@models/appdispatch';
import {PossibleResource, isPossibleResource} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {AnyPlugin} from '@models/plugin';
import {TemplateManifest, TemplatePack, VanillaTemplate} from '@models/template';

import {setAlert} from '@redux/reducers/alert';
import {removePlugin, removeTemplate, removeTemplatePack} from '@redux/reducers/extension';

import electronStore from '@utils/electronStore';

import {extractObjectsFromYaml} from './manifest-utils';
import {createMultipleUnsavedResources} from './unsavedResource';

export const deleteStandalonTemplate = async (templatePath: string, dispatch: AppDispatch) => {
  dispatch(removeTemplate(templatePath));

  const alert: AlertType = {
    title: 'Deleted template successfully',
    type: AlertEnum.Success,
    message: '',
  };
  fs.rm(templatePath, {recursive: true, force: true}, () => {
    dispatch(setAlert(alert));
  });
};

export const deletePlugin = async (plugin: AnyPlugin, pluginPath: string, dispatch: AppDispatch) => {
  const modules = plugin.modules;
  let deletedTemplates = 0;

  modules.forEach(m => {
    if (m.type === 'template') {
      dispatch(removeTemplate(m.path));
      deletedTemplates += 1;
    }
  });
  dispatch(removePlugin(pluginPath));

  let repositoryUrl = `https://github.com/${plugin.repository.owner}/${plugin.repository.name}`;

  if (repositoryUrl === DEFAULT_TEMPLATES_PLUGIN_URL) {
    electronStore.set('appConfig.hasDeletedDefaultTemplatesPlugin', true);
  }

  const alert: AlertType = {
    title: `Deleted templates (${deletedTemplates}) successfully`,
    type: AlertEnum.Success,
    message: '',
  };
  fs.rm(pluginPath, {recursive: true, force: true}, () => {
    dispatch(setAlert(alert));
  });
};

export const deleteTemplatePack = async (
  templatePack: TemplatePack,
  templatePackPath: string,
  dispatch: AppDispatch
) => {
  const templates = templatePack.templates;

  templates.forEach(template => {
    dispatch(removeTemplate(template.path));
  });
  dispatch(removeTemplatePack(templatePackPath));

  const alert: AlertType = {
    title: `Deleted templates (${templates.length}) successfully`,
    type: AlertEnum.Success,
    message: '',
  };
  fs.rm(templatePackPath, {recursive: true, force: true}, () => {
    dispatch(setAlert(alert));
  });
};

export const isStandaloneTemplate = (templatePath: string, templatesDir: string) =>
  templatePath.startsWith(templatesDir);

export const isTemplatePackTemplate = (templatePath: string, templatesPacksDir: string) =>
  templatePath.startsWith(templatesPacksDir);

export const isPluginTemplate = (templatePath: string, pluginsDir: string) => templatePath.startsWith(pluginsDir);

export type InterpolateTemplateOptions = {
  templateText: string;
  formsData: any[];
};

export const interpolateTemplate = async (templateText: string, formsData: any[]) => {
  return new Promise<string>(resolve => {
    ipcRenderer.once('interpolate-vanilla-template-result', (event, arg) => {
      resolve(arg);
    });
    ipcRenderer.send('interpolate-vanilla-template', {
      templateText,
      formsData,
    } as InterpolateTemplateOptions);
  });
};

export const createUnsavedResourcesFromVanillaTemplate = async (
  template: VanillaTemplate,
  formsData: any[],
  dispatch: AppDispatch
) => {
  const resourceTextList: (string | undefined)[] = await asyncLib.map(
    template.manifests,
    async (manifest: TemplateManifest) => {
      try {
        const manifestText = await fs.promises.readFile(manifest.filePath, 'utf8');
        const interpolatedTemplateText = await interpolateTemplate(manifestText, formsData);
        return interpolatedTemplateText;
      } catch (e) {
        if (e instanceof Error) {
          log.warn(`[createUnsavedResourcesFromVanillaTemplate]: ${e.message}`);
          return undefined;
        }
      }
    }
  );

  let objects: PossibleResource[] = [];

  resourceTextList
    .filter((text): text is string => typeof text === 'string')
    .forEach(resourceText => {
      objects = [...objects, ...extractObjectsFromYaml(resourceText)];
    });

  const inputs = objects
    .filter(obj => isPossibleResource(obj))
    .map(obj => ({
      name: obj.metadata.name,
      namespace: obj.metadata.namespace,
      kind: obj.kind,
      apiVersion: obj.apiVersion,
      obj,
    }));

  const createdResources: K8sResource[] = createMultipleUnsavedResources(inputs, dispatch);

  return {message: template.resultMessage || 'Done.', resources: createdResources};
};
