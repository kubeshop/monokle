import asyncLib from 'async';
import fs from 'fs';
import _ from 'lodash';
import log from 'loglevel';

import {AlertEnum, AlertType} from '@models/alert';
import {AppDispatch} from '@models/appdispatch';
import {K8sResource} from '@models/k8sresource';
import {AnyPlugin} from '@models/plugin';
import {TemplateManifest, TemplatePack, VanillaTemplate} from '@models/template';

import {setAlert} from '@redux/reducers/alert';
import {removePlugin, removeTemplate, removeTemplatePack} from '@redux/reducers/extension';

import {extractObjectsFromYaml} from './manifest-utils';
import {createUnsavedResource} from './unsavedResource';

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

export const interpolateTemplate = (text: string, formsData: any[]) => {
  _.templateSettings.interpolate = /\[\[([\s\S]+?)\]\]/g;
  const lodashTemplate = _.template(text);
  const result = lodashTemplate({forms: formsData});
  return result;
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
        const interpolatedTemplateText = interpolateTemplate(manifestText, formsData);
        return interpolatedTemplateText;
      } catch (e) {
        if (e instanceof Error) {
          log.warn(`[createUnsavedResourcesFromVanillaTemplate]: ${e.message}`);
          return undefined;
        }
      }
    }
  );
  const createdResources: K8sResource[] = [];
  resourceTextList
    .filter((text): text is string => typeof text === 'string')
    .forEach(resourceText => {
      const objects = extractObjectsFromYaml(resourceText);
      objects.forEach(obj => {
        const resource = createUnsavedResource(
          {
            name: obj.metadata.name,
            namespace: obj.metadata.namespace,
            kind: obj.kind,
            apiVersion: obj.apiVersion,
          },
          dispatch,
          obj
        );
        createdResources.push(resource);
      });
    });
  return {message: template.resultMessage || 'Done.', resources: createdResources};
};
