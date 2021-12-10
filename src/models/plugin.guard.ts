import _ from 'lodash';

import {
  BundledHelmChartTemplatePluginModule,
  GitRepository,
  HelmChartTemplatePluginModule,
  MonoklePlugin,
  MonoklePluginModule,
  PackageJsonMonoklePlugin,
  ReferencedHelmChartTemplatePluginModule,
  TemplateForm,
  TemplateManifest,
  TemplatePluginModule,
  VanillaTemplatePluginModule,
} from './plugin';

export function isGitRepository(obj: any): obj is GitRepository {
  return (
    typeof obj === 'object' &&
    typeof obj.owner === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.branch === 'string'
  );
}

export function isTemplateForm(obj: any): obj is TemplateForm {
  return (
    typeof obj === 'object' &&
    typeof obj.name === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.schema === 'string' &&
    typeof obj.uiSchema === 'string'
  );
}

export function isTemplateManifest(obj: any): obj is TemplateManifest {
  return typeof obj === 'object' && typeof obj.filePath === 'string' && obj.fileRenameRule === 'string';
}

export function isVanillaTemplatePluginModule(obj: any): obj is VanillaTemplatePluginModule {
  return (
    typeof obj === 'object' &&
    obj.type === 'templates/vanilla' &&
    typeof obj.id === 'string' &&
    _.isArray(obj.forms) &&
    obj.forms.every((form: any) => isTemplateForm(form)) &&
    _.isArray(obj.manifests) &&
    obj.manifests.every((manifest: any) => isTemplateManifest(manifest))
  );
}

export function isBundledHelmChartTemplatePluginModule(obj: any): obj is BundledHelmChartTemplatePluginModule {
  return (
    typeof obj === 'object' &&
    obj.type === 'templates/helm-chart' &&
    !obj.isReferenced &&
    typeof obj.id === 'string' &&
    _.isArray(obj.forms) &&
    obj.forms.every((form: any) => isTemplateForm(form)) &&
    typeof obj.valuesFilePath === 'string'
  );
}

export function isReferencedHelmChartTemplatePluginModule(obj: any): obj is ReferencedHelmChartTemplatePluginModule {
  return (
    typeof obj === 'object' &&
    obj.type === 'templates/helm-chart' &&
    obj.isReferenced === true &&
    typeof obj.id === 'string' &&
    _.isArray(obj.forms) &&
    obj.forms.every((form: any) => isTemplateForm(form)) &&
    typeof obj.valuesFilePath === 'string' &&
    typeof obj.chartName === 'string' &&
    typeof obj.chartVersion === 'string' &&
    typeof obj.chartRepo === 'string' &&
    typeof obj.helpUrl === 'string'
  );
}

export function isHelmChartTemplatePuginModule(obj: any): obj is HelmChartTemplatePluginModule {
  return isBundledHelmChartTemplatePluginModule(obj) || isReferencedHelmChartTemplatePluginModule(obj);
}

export function isTemplatePluginModule(obj: any): obj is TemplatePluginModule {
  return isVanillaTemplatePluginModule(obj) || isHelmChartTemplatePuginModule(obj);
}

export function isMonoklePluginModule(obj: any): obj is MonoklePluginModule {
  return isTemplatePluginModule(obj);
}

export function isMonoklePlugin(obj: any): obj is MonoklePlugin {
  return (
    typeof obj === 'object' &&
    typeof obj.name === 'string' &&
    typeof obj.version === 'string' &&
    typeof obj.author === 'string' &&
    (!obj.description || typeof obj.description === 'string') &&
    isGitRepository(obj.repository) &&
    typeof obj.isActive === 'boolean' &&
    _.isArray(obj.modules) &&
    obj.modules.every((module: any) => isMonoklePluginModule(module))
  );
}

export function isPackageJsonMonoklePlugin(obj: any): obj is PackageJsonMonoklePlugin {
  if (typeof obj !== 'object') {
    return false;
  }
  const {name, version, author, monoklePlugin} = obj;
  const arePackageJsonPropertiesValid =
    typeof name === 'string' &&
    typeof version === 'string' &&
    typeof author === 'string' &&
    typeof monoklePlugin === 'object';
  if (!arePackageJsonPropertiesValid) {
    return false;
  }
  const isMonoklePluginPropertyValid =
    Boolean(monoklePlugin) &&
    Boolean(_.isArray(monoklePlugin.modules)) &&
    Boolean(monoklePlugin.modules.every((module: any) => isMonoklePluginModule(module)));
  return isMonoklePluginPropertyValid;
}
