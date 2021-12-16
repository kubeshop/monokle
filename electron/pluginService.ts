import path from 'path';

import {MonoklePlugin, PluginPackageJson, isPluginPackageJson, isTemplatePluginModule} from '@models/plugin';

import downloadExtension from './extensions/downloadExtension';
import loadMultipleExtensions from './extensions/loadMultipleExtensions';

const GITHUB_URL = 'https://github.com';
const GITHUB_REPOSITORY_REGEX = /^https:\/\/github.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/i;

function isValidRepositoryUrl(repositoryUrl: string) {
  return GITHUB_REPOSITORY_REGEX.test(repositoryUrl);
}

function extractRepositoryOwnerAndNameFromUrl(pluginUrl: string) {
  if (!isValidRepositoryUrl(pluginUrl)) {
    throw new Error('Invalig repository URL');
  }
  const repositoryPath = pluginUrl.split(`${GITHUB_URL}/`)[1];
  const [repositoryOwner, repositoryName] = repositoryPath.split('/');

  return {
    repositoryOwner,
    repositoryName,
  };
}

function transformPackageJsonToMonoklePlugin(packageJson: PluginPackageJson): MonoklePlugin {
  const {repositoryOwner, repositoryName} = extractRepositoryOwnerAndNameFromUrl(packageJson.repository);
  const plugin: MonoklePlugin = {
    name: packageJson.name,
    author: packageJson.author,
    version: packageJson.version,
    description: packageJson.description,
    isActive: packageJson.monoklePlugin.modules.every(module => isTemplatePluginModule(module)),
    repository: {
      owner: repositoryOwner,
      name: repositoryName,
      branch: 'main', // TODO: handle the branch name
    },
    modules: packageJson.monoklePlugin.modules,
  };
  return plugin;
}

export async function downloadPlugin(pluginUrl: string, allPluginsFolderPath: string) {
  const {repositoryOwner, repositoryName} = extractRepositoryOwnerAndNameFromUrl(pluginUrl);
  const packageJsonUrl = `https://raw.githubusercontent.com/${repositoryOwner}/${repositoryName}/main/package.json`;
  const pluginTarballUrl = `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/tarball/main`;
  const plugin: MonoklePlugin = await downloadExtension({
    extensionTarballUrl: pluginTarballUrl,
    entryFileName: 'package.json',
    entryFileUrl: packageJsonUrl,
    parseEntryFileContent: JSON.parse,
    isEntryFileContentValid: isPluginPackageJson,
    transformEntryFileContentToExtension: transformPackageJsonToMonoklePlugin,
    makeExtensionFolderPath: () => {
      return path.join(allPluginsFolderPath, `${repositoryOwner}-${repositoryName}`);
    },
  });
  return plugin;
}

export async function loadPlugins(pluginsDir: string) {
  const plugins: MonoklePlugin[] = await loadMultipleExtensions<PluginPackageJson, MonoklePlugin>({
    folderPath: pluginsDir,
    entryFileName: 'package.json',
    parseEntryFileContent: JSON.parse,
    isEntryFileContentValid: isPluginPackageJson,
    transformEntryFileContentToExtension: transformPackageJsonToMonoklePlugin,
  });
  return plugins;
}
