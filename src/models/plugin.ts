import {Merge, PackageJson} from 'type-fest';

type PackageJsonMonoklePlugin = Merge<
  PackageJson,
  {
    monoklePlugin?: {
      modules: MonoklePluginModule[];
    };
  }
>;

interface MonoklePluginRepositoryLatestRelease {
  commitHash: string;
  tagName: string;
  tarballUrl: string;
}

interface MonoklePluginRepository {
  owner: string;
  name: string;
  url: string;
  latestRelease: MonoklePluginRepositoryLatestRelease;
}

interface MonoklePluginModule {
  id: string;
  type: string;
  source: string;
  description?: string;
}

interface MonoklePlugin {
  name: string;
  version: string;
  author: string;
  description?: string;
  location: string;
  repository: MonoklePluginRepository;
  isActive: boolean;
  isInstalled: boolean;
  modules: MonoklePluginModule[];
}

export type {
  MonoklePlugin,
  MonoklePluginModule,
  MonoklePluginRepository,
  MonoklePluginRepositoryLatestRelease,
  PackageJsonMonoklePlugin,
};
