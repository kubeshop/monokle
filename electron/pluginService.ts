import log from 'loglevel';
import path from 'path';

import {
  AnyPlugin,
  PluginPackageJson,
  isTemplatePluginModule,
  validatePluginPackageJson,
  validateTemplatePluginModule,
} from '@models/plugin';

import downloadExtension from './extensions/downloadExtension';
import {createFolder, doesPathExist} from './extensions/fileSystem';
import loadMultipleExtensions from './extensions/loadMultipleExtensions';
import {extractRepositoryOwnerAndNameFromUrl} from './utils';

function transformPackageJsonToAnyPlugin(packageJson: PluginPackageJson, folderPath: string): AnyPlugin {
  const {repositoryOwner, repositoryName} = extractRepositoryOwnerAndNameFromUrl(packageJson.repository);
  const plugin: AnyPlugin = {
    name: packageJson.name,
    author: packageJson.author,
    version: packageJson.version,
    description: packageJson.description,
    isActive: packageJson.monoklePlugin.modules.every(module => validateTemplatePluginModule(module)),
    repository: {
      owner: repositoryOwner,
      name: repositoryName,
      branch: 'main', // TODO: handle the branch name
    },
    modules: packageJson.monoklePlugin.modules.map(module => {
      if (isTemplatePluginModule(module)) {
        return {
          ...module,
          path: path.join(folderPath, module.path),
        };
      }
      return module;
    }),
  };
  return plugin;
}

export async function downloadPlugin(pluginUrl: string, allPluginsFolderPath: string) {
  const {repositoryOwner, repositoryName} = extractRepositoryOwnerAndNameFromUrl(pluginUrl);
  const packageJsonUrl = `https://raw.githubusercontent.com/${repositoryOwner}/${repositoryName}/main/package.json`;
  const pluginTarballUrl = `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/tarball/main`;
  const plugin: AnyPlugin = await downloadExtension<PluginPackageJson, AnyPlugin>({
    extensionTarballUrl: pluginTarballUrl,
    entryFileName: 'package.json',
    entryFileUrl: packageJsonUrl,
    parseEntryFileContent: JSON.parse,
    validateEntryFileContent: validatePluginPackageJson,
    transformEntryFileContentToExtension: transformPackageJsonToAnyPlugin,
    makeExtensionFolderPath: () => {
      return path.join(allPluginsFolderPath, `${repositoryOwner}-${repositoryName}`);
    },
  });
  return plugin;
}

export async function loadPlugins(pluginsDir: string) {
  try {
    const doesPluginsDirExist = await doesPathExist(pluginsDir);
    if (!doesPluginsDirExist) {
      await createFolder(pluginsDir);
    }
  } catch (e) {
    if (e instanceof Error) {
      log.warn(`[loadPlugins]: Couldn't load plugins: ${e.message}`);
    }
    return [];
  }
  const plugins: AnyPlugin[] = await loadMultipleExtensions<PluginPackageJson, AnyPlugin>({
    folderPath: pluginsDir,
    entryFileName: 'package.json',
    parseEntryFileContent: JSON.parse,
    validateEntryFileContent: validatePluginPackageJson,
    transformEntryFileContentToExtension: transformPackageJsonToAnyPlugin,
  });
  return plugins;
}
