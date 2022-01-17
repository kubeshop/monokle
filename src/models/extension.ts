import _ from 'lodash';

import {AnyPlugin, isAnyPlugin} from './plugin';
import {AnyTemplate, TemplatePack, isAnyTemplate, isTemplatePack} from './template';

export interface ExtensionState {
  isLoadingExistingPlugins: boolean;
  pluginMap: Record<string, AnyPlugin>;
  isLoadingExistingTemplates: boolean;
  templateMap: Record<string, AnyTemplate>;
  isLoadingExistingTemplatePacks: boolean;
  templatePackMap: Record<string, TemplatePack>;
  templatesDir?: string;
  templatePacksDir?: string;
  pluginsDir?: string;
}

export type AnyExtension<ExtensionType> = {
  extension: ExtensionType;
  folderPath: string;
};

export function isAnyExtension<ExtensionType>(
  obj: any,
  isExtensionType: (x: any) => x is ExtensionType
): obj is AnyExtension<ExtensionType> {
  if (!obj?.extension || !obj?.folderPath) {
    return false;
  }
  if (typeof obj.folderPath !== 'string') {
    return false;
  }
  if (!isExtensionType(obj.extension)) {
    return false;
  }
  return true;
}

export function isPluginExtension(obj: any): obj is AnyExtension<AnyPlugin> {
  return isAnyExtension(obj, isAnyPlugin);
}

export function isTemplateExtension(obj: any): obj is AnyExtension<AnyPlugin> {
  return isAnyExtension(obj, isAnyTemplate);
}

export function isTemplatePackExtension(obj: any): obj is AnyExtension<AnyPlugin> {
  return isAnyExtension(obj, isTemplatePack);
}

export type DownloadPluginResult = {
  pluginExtension: AnyExtension<AnyPlugin>;
  templateExtensions: AnyExtension<AnyTemplate>[];
};

export type DownloadTemplateResult = {
  templateExtension: AnyExtension<AnyTemplate>;
};

export type DownloadTemplatePackResult = {
  templatePackExtension: AnyExtension<TemplatePack>;
  templateExtensions: AnyExtension<AnyTemplate>[];
};

export type UpdateExtensionsResult = {
  pluginExtensions: AnyExtension<AnyPlugin>[];
  templateExtensions: AnyExtension<AnyTemplate>[];
  templatePackExtensions: AnyExtension<TemplatePack>[];
};

export function isUpdateExtensionsResult(obj: any): obj is UpdateExtensionsResult {
  if (!_.isObjectLike(obj)) {
    return false;
  }
  const {pluginExtensions, templateExtensions, templatePackExtensions} = obj;
  if (!_.isArray(pluginExtensions) || !_.isArray(templateExtensions) || !_.isArray(templatePackExtensions)) {
    return false;
  }
  return (
    pluginExtensions.every(p => isPluginExtension(p)) &&
    templateExtensions.every(t => isTemplateExtension(t)) &&
    templatePackExtensions.every(tp => isTemplatePackExtension(tp))
  );
}

export function isDownloadPluginResult(obj: any): obj is DownloadPluginResult {
  if (!_.isObjectLike(obj)) {
    return false;
  }
  const {pluginExtension, templateExtensions} = obj;
  if (!pluginExtension || !_.isArray(templateExtensions)) {
    return false;
  }
  return isPluginExtension(pluginExtension) && templateExtensions.every(te => isTemplateExtension(te));
}

export function isDownloadTemplateResult(obj: any): obj is DownloadTemplateResult {
  if (!_.isObjectLike(obj)) {
    return false;
  }
  const {templateExtension} = obj;
  if (!templateExtension) {
    return false;
  }
  return isTemplateExtension(templateExtension);
}

export function isDownloadTemplatePackResult(obj: any): obj is DownloadTemplatePackResult {
  if (!_.isObjectLike(obj)) {
    return false;
  }
  const {templatePackExtension, templateExtensions} = obj;
  if (!templatePackExtension || !_.isArray(templateExtensions)) {
    return false;
  }
  return isTemplatePackExtension(templatePackExtension) && templateExtensions.every(te => isTemplateExtension(te));
}
