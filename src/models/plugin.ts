import {Merge, PackageJson, SetRequired} from 'type-fest';

type PackageJsonMonoklePlugin = SetRequired<
  Merge<
    PackageJson,
    {
      monoklePlugin: {
        modules: MonoklePluginModule[];
      };
    }
  >,
  'name' | 'author' | 'version'
>;

interface GitRepository {
  owner: string;
  name: string;
  branch: string;
}

interface TemplateForm {
  name: string;
  description: string;
  schema: string;
  uiSchema: string;
}

interface TemplateManifest {
  filePath: string;
  fileRenameRule: string;
}

interface VanillaTemplatePluginModule {
  type: 'templates/vanilla';
  id: string;
  forms: TemplateForm[];
  manifests: TemplateManifest[];
}

interface BundledHelmChartTemplatePluginModule {
  type: 'templates/helm-chart';
  isReferenced?: false;
  id: string;
  forms: TemplateForm[];
  valuesFilePath: string;
}

interface ReferencedHelmChartTemplatePluginModule {
  type: 'templates/helm-chart';
  isReferenced: true;
  id: string;
  forms: TemplateForm[];
  valuesFilePath: string;
  chartName: string;
  chartVersion: string;
  chartRepo: string;
  helpUrl: string;
}

type HelmChartTemplatePluginModule = BundledHelmChartTemplatePluginModule | ReferencedHelmChartTemplatePluginModule;

type TemplatePluginModule = VanillaTemplatePluginModule | HelmChartTemplatePluginModule;

type MonoklePluginModule = TemplatePluginModule; // this will get extended by other types of plugins that we'll support

interface MonoklePlugin {
  name: string;
  version: string;
  author: string;
  description?: string;
  repository: GitRepository;
  isActive: boolean;
  modules: MonoklePluginModule[];
}

export type {
  MonoklePlugin,
  MonoklePluginModule,
  GitRepository,
  PackageJsonMonoklePlugin,
  TemplateForm,
  TemplateManifest,
  TemplatePluginModule,
  VanillaTemplatePluginModule,
  HelmChartTemplatePluginModule,
  ReferencedHelmChartTemplatePluginModule,
  BundledHelmChartTemplatePluginModule,
};
