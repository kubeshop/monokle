import log from 'loglevel';
import path from 'path';
import semver from 'semver';

import {
  AnyPlugin,
  PluginPackageJson,
  isTemplatePluginModule,
  validateAnyPlugin,
  validatePluginPackageJson,
  validateTemplatePluginModule,
} from '@models/plugin';

import downloadExtension from './extensions/downloadExtension';
import downloadExtensionEntry from './extensions/downloadExtensionEntry';
import {createFolder, doesPathExist} from './extensions/fileSystem';
import loadMultipleExtensions from './extensions/loadMultipleExtensions';
import {extractRepositoryOwnerAndNameFromUrl, makeExtensionDownloadData} from './utils';

const PLUGIN_ENTRY_FILE_NAME = 'package.json';

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
  const {entryFileUrl, tarballUrl, folderPath} = makeExtensionDownloadData(
    pluginUrl,
    PLUGIN_ENTRY_FILE_NAME,
    allPluginsFolderPath
  );
  const plugin: AnyPlugin = await downloadExtension<PluginPackageJson, AnyPlugin>({
    extensionTarballUrl: tarballUrl,
    entryFileName: 'package.json',
    entryFileUrl,
    parseEntryFileContent: JSON.parse,
    validateEntryFileContent: validatePluginPackageJson,
    transformEntryFileContentToExtension: transformPackageJsonToAnyPlugin,
    makeExtensionFolderPath: () => {
      return folderPath;
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

export async function updatePlugin(
  plugin: AnyPlugin,
  pluginsDir: string,
  userTempDir: string
): Promise<AnyPlugin | undefined> {
  const repositoryUrl = `https://github.com/${plugin.repository.owner}/${plugin.repository.name}`;
  const {entryFileUrl, folderPath} = makeExtensionDownloadData(repositoryUrl, PLUGIN_ENTRY_FILE_NAME, userTempDir);
  const tempPluginEntry = await downloadExtensionEntry({
    entryFileName: PLUGIN_ENTRY_FILE_NAME,
    entryFileUrl,
    makeExtensionFolderPath: () => folderPath,
    parseEntryFileContent: JSON.parse,
    validateEntryFileContent: validateAnyPlugin,
  });
  if (semver.lt(plugin.version, tempPluginEntry.version)) {
    const newPlugin = await downloadPlugin(repositoryUrl, pluginsDir);
    return newPlugin;
  }
  return undefined;
}
