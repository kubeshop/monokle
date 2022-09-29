import log from 'loglevel';
import path from 'path';
import semver from 'semver';

import {AnyExtension} from '@models/extension';
import {
  AnyPlugin,
  PluginPackageJson,
  isTemplatePluginModule,
  validatePluginPackageJson,
  validateTemplatePluginModule,
} from '@models/plugin';

import {createFolder, doesPathExist} from '@utils/fileSystem';

import downloadExtension from '../extensions/downloadExtension';
import downloadExtensionEntry from '../extensions/downloadExtensionEntry';
import loadMultipleExtensions from '../extensions/loadMultipleExtensions';
import {convertExtensionsToRecord, extractRepositoryOwnerAndNameFromUrl, makeExtensionDownloadData} from '../utils';

const PLUGIN_ENTRY_FILE_NAME = 'package.json';

function transformPackageJsonToAnyPlugin(packageJson: PluginPackageJson, folderPath: string): AnyPlugin {
  const {repositoryOwner, repositoryName, repositoryBranch} = extractRepositoryOwnerAndNameFromUrl(
    packageJson.repository
  );
  let icon = packageJson.monoklePlugin.icon;
  if (icon && !icon.includes('http')) {
    icon = path.join(folderPath, icon);
  }
  const plugin: AnyPlugin = {
    id: packageJson.monoklePlugin.id,
    name: packageJson.name,
    author: packageJson.author,
    version: packageJson.version,
    description: packageJson.description,
    isActive: packageJson.monoklePlugin.modules.every(module => validateTemplatePluginModule(module)),
    repository: {
      owner: repositoryOwner,
      name: repositoryName,
      branch: repositoryBranch,
    },
    icon,
    modules: packageJson.monoklePlugin.modules.map(module => {
      if (isTemplatePluginModule(module)) {
        return {
          ...module,
          path: path.join(folderPath, module.path),
        };
      }
      return module;
    }),
    helpUrl: packageJson.monoklePlugin.helpUrl,
  };
  return plugin;
}

export async function downloadPlugin(
  pluginUrl: string,
  allPluginsFolderPath: string
): Promise<AnyExtension<AnyPlugin>> {
  const {entryFileUrl, tarballUrl, folderPath} = makeExtensionDownloadData(
    pluginUrl,
    PLUGIN_ENTRY_FILE_NAME,
    allPluginsFolderPath
  );
  const plugin: AnyPlugin = await downloadExtension<PluginPackageJson, AnyPlugin>({
    extensionTarballUrl: tarballUrl,
    entryFileName: 'package.json',
    entryFileUrl,
    parseEntryFileContent: parseEntryFileContentHandler.bind(null, pluginUrl),
    validateEntryFileContent: validatePluginPackageJson,
    transformEntryFileContentToExtension: transformPackageJsonToAnyPlugin,
    makeExtensionFolderPath: () => {
      return folderPath;
    },
  });
  return {extension: plugin, folderPath};
}

export async function loadPluginMap(pluginsDir: string): Promise<Record<string, AnyPlugin>> {
  try {
    const doesPluginsDirExist = await doesPathExist(pluginsDir);
    if (!doesPluginsDirExist) {
      await createFolder(pluginsDir);
    }
  } catch (e) {
    if (e instanceof Error) {
      log.warn(`[loadPlugins]: Couldn't load plugins: ${e.message}`);
    }
    return {};
  }
  const pluginExtensions: AnyExtension<AnyPlugin>[] = await loadMultipleExtensions<PluginPackageJson, AnyPlugin>({
    folderPath: pluginsDir,
    entryFileName: 'package.json',
    parseEntryFileContent: JSON.parse,
    validateEntryFileContent: validatePluginPackageJson,
    transformEntryFileContentToExtension: transformPackageJsonToAnyPlugin,
  });
  return convertExtensionsToRecord(pluginExtensions);
}

export async function updatePlugin(
  plugin: AnyPlugin,
  pluginsDir: string,
  userTempDir: string
): Promise<AnyExtension<AnyPlugin> | undefined> {
  let repositoryUrl;

  if (plugin.repository.branch) {
    repositoryUrl = `https://github.com/${plugin.repository.owner}/${plugin.repository.name}/tree/${plugin.repository.branch}`;
  } else {
    repositoryUrl = `https://github.com/${plugin.repository.owner}/${plugin.repository.name}`;
  }

  const {entryFileUrl, folderPath} = makeExtensionDownloadData(repositoryUrl, PLUGIN_ENTRY_FILE_NAME, userTempDir);
  let tempPluginEntry: PluginPackageJson;
  try {
    tempPluginEntry = await downloadExtensionEntry({
      entryFileName: PLUGIN_ENTRY_FILE_NAME,
      entryFileUrl,
      makeExtensionFolderPath: () => folderPath,
      parseEntryFileContent: JSON.parse,
      validateEntryFileContent: validatePluginPackageJson,
    });
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`Failed to update plugin ${plugin.name} by ${plugin.author}`);
    }
    return;
  }

  if (semver.lt(plugin.version, tempPluginEntry.version)) {
    try {
      const pluginExtension = await downloadPlugin(repositoryUrl, pluginsDir);
      return pluginExtension;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(
          `Failed to update plugin ${plugin.name} by ${plugin.author} from version ${plugin.version} to ${tempPluginEntry.version}`
        );
      }
    }
  }
  return undefined;
}

export const parseEntryFileContentHandler = (pluginUrl: string, entryFileContext: string) => {
  const entryFile = JSON.parse(entryFileContext);
  if (pluginUrl) {
    entryFile.repository = pluginUrl;
  }
  return entryFile;
};
