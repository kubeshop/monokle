import _ from 'lodash';

import {
  GitRepository,
  HelmChartTemplatePluginModule,
  MonoklePlugin,
  TemplateForm,
  TemplateManifest,
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
    obj.description === 'string' &&
    obj.schema === 'string' &&
    obj.uiSchema === 'string'
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

export function isBundledHelmChartTemplatePluginModule(obj: any): obj is HelmChartTemplatePluginModule {
  return (
    typeof obj === 'object' &&
    obj.type === 'templates/helm-chart' &&
    !obj.isReferenced &&
    typeof obj.id === 'string' &&
    _.isArray(obj.forms) &&
    obj.forms.every((form: any) => isTemplateForm(form))
  );
}

export function isReferencedHelmChartTemplatePluginModule(obj: any): obj is HelmChartTemplatePluginModule {
  return (
    typeof obj === 'object' &&
    obj.type === 'templates/helm-chart' &&
    obj.isReferenced === true &&
    typeof obj.id === 'string' &&
    _.isArray(obj.forms) &&
    obj.forms.every((form: any) => isTemplateForm(form)) &&
    typeof obj.chartName === 'string' &&
    typeof obj.chartVersion === 'string' &&
    typeof obj.chartRepo === 'string' &&
    typeof obj.helpUrl === 'string'
  );
}

export function isHelmChartTemplatePuginModule(obj: any): obj is HelmChartTemplatePluginModule {
  return isBundledHelmChartTemplatePluginModule(obj) || isReferencedHelmChartTemplatePluginModule(obj);
}

export function isMonoklePluginModule(obj: any) {
  return isVanillaTemplatePluginModule(obj) || isHelmChartTemplatePuginModule(obj);
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
