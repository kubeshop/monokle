import path from 'path';

import {MonoklePlugin, PluginPackageJson, isPluginPackageJson, isTemplatePluginModule} from '@models/plugin';

import downloadExtension from './extensions/downloadExtension';
import loadMultipleExtensions from './extensions/loadMultipleExtensions';
import {extractRepositoryOwnerAndNameFromUrl} from './utils';

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
