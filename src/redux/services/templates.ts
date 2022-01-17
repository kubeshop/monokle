import fs from 'fs';
import _ from 'lodash';

import {TemplatePack} from '@models/template';

import {removeTemplate} from '@redux/reducers/extension';
import {AppDispatch} from '@redux/store';

export const deleteStandalonTemplate = async (templatePath: string, dispatch: AppDispatch) => {
  dispatch(removeTemplate(templatePath));
  fs.rm(templatePath, {recursive: true, force: true}, () => {});
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
  fs.rm(templatePackPath, {recursive: true, force: true}, () => {});
};

export const isStandaloneTemplate = (templatePath: string, templatesDir: string) =>
  templatePath.startsWith(templatesDir);

export const isTemplatePackTemplate = (templatePath: string, templatesPacksDir: string) =>
  templatePath.startsWith(templatesPacksDir);

export const isPluginTemplate = (templatePath: string, pluginsDir: string) => templatePath.startsWith(pluginsDir);

export const interpolateTemplate = (text: string, formsData: any[]) => {
  _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
  const lodashTemplate = _.template(text);
  return lodashTemplate({forms: formsData});
};
