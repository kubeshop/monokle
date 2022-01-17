import fs from 'fs';

import {AnyPlugin} from '@models/plugin';
import {TemplatePack} from '@models/template';

import {removePlugin, removeTemplate, removeTemplatePack} from '@redux/reducers/extension';
import {AppDispatch} from '@redux/store';

export const deleteStandalonTemplate = async (templatePath: string, dispatch: AppDispatch) => {
  dispatch(removeTemplate(templatePath));
  fs.rm(templatePath, {recursive: true, force: true}, () => {});
};

export const deletePlugin = async (plugin: AnyPlugin, pluginPath: string, dispatch: AppDispatch) => {
  const modules = plugin.modules;

  modules.forEach(m => {
    if (m.type === 'template') {
      dispatch(removeTemplate(m.path));
    }
  });
  dispatch(removePlugin(pluginPath));
  fs.rm(pluginPath, {recursive: true, force: true}, () => {});
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
  fs.rm(templatePackPath, {recursive: true, force: true}, () => {});
};

export const isStandaloneTemplate = (templatePath: string, templatesDir: string) =>
  templatePath.startsWith(templatesDir);

export const isTemplatePackTemplate = (templatePath: string, templatesPacksDir: string) =>
  templatePath.startsWith(templatesPacksDir);

export const isPluginTemplate = (templatePath: string, pluginsDir: string) => templatePath.startsWith(pluginsDir);
