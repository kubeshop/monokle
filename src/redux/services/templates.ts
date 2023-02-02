/* eslint-disable no-restricted-syntax */
import {ipcRenderer} from 'electron';

import asyncLib from 'async';
import fs from 'fs';
import log from 'loglevel';

import {setAlert} from '@redux/reducers/alert';
import {removePlugin, removeTemplate, removeTemplatePack} from '@redux/reducers/extension';

import {DEFAULT_TEMPLATES_PLUGIN_URL} from '@shared/constants/urls';
import {AlertEnum, AlertType} from '@shared/models/alert';
import {AppDispatch} from '@shared/models/appDispatch';
import {K8sObject, isK8sObject} from '@shared/models/k8s';
import {K8sResource} from '@shared/models/k8sResource';
import {AnyPlugin} from '@shared/models/plugin';
import {InterpolateTemplateOptions, TemplateManifest, TemplatePack, VanillaTemplate} from '@shared/models/template';
import electronStore from '@shared/utils/electronStore';

import {extractObjectsFromYaml} from './manifest-utils';
import {createMultipleTransientResources} from './transientResource';

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

export const createTransientResourcesFromVanillaTemplate = async (
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
          log.warn(`[createTransientResourcesFromVanillaTemplate]: ${e.message}`);
          return undefined;
        }
      }
    }
  );

  let objects: K8sObject[] = [];

  resourceTextList
    .filter((text): text is string => typeof text === 'string')
    .forEach(resourceText => {
      objects = [...objects, ...extractObjectsFromYaml(resourceText)];
    });

  const inputs = objects
    .filter(obj => isK8sObject(obj))
    .map(obj => ({
      name: obj.metadata.name,
      namespace: obj.metadata.namespace,
      kind: obj.kind,
      apiVersion: obj.apiVersion,
      obj,
    }));

  const createdResources: K8sResource[] = createMultipleTransientResources(inputs, dispatch);

  return {message: template.resultMessage || 'Done.', resources: createdResources};
};
