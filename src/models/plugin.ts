import {Merge, PackageJson} from 'type-fest';

type PackageJsonMonoklePlugin = Merge<
  PackageJson,
  {
    monoklePlugin?: {
      modules: MonoklePluginModule[];
    };
  }
>;

interface GitRepositoryLatestRelease {
  commitHash: string;
  tagName: string;
  tarballUrl: string;
}

interface GitRepository {
  owner: string;
  name: string;
  url: string;
  latestRelease: GitRepositoryLatestRelease;
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
}

interface ReferencedHelmChartTemplatePluginModule {
  type: 'templates/helm-chart';
  isReferenced: true;
  id: string;
  forms: TemplateForm[];
  chartName: string;
  chartVersion: string;
  chartRepo: string;
  helpUrl: string;
}

type HelmChartTemplatePluginModule = BundledHelmChartTemplatePluginModule | ReferencedHelmChartTemplatePluginModule;

type MonoklePluginModule = VanillaTemplatePluginModule | HelmChartTemplatePluginModule;

interface MonoklePlugin {
  name: string;
  version: string;
  author: string;
  description?: string;
  location: string;
  repository: GitRepository;
  isActive: boolean;
  isInstalled: boolean;
  modules: MonoklePluginModule[];
}

export type {MonoklePlugin, MonoklePluginModule, GitRepository, GitRepositoryLatestRelease, PackageJsonMonoklePlugin};
