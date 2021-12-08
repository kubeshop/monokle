import fs from 'fs';
import log from 'loglevel';
import fetch from 'node-fetch';
import path from 'path';
import tar from 'tar';
import {PackageJson} from 'type-fest';
import util from 'util';

import {MonoklePlugin, PackageJsonMonoklePlugin} from '@models/plugin';

import {downloadFile} from '@utils/http';

const fsExistsPromise = util.promisify(fs.exists);
const fsReadFilePromise = util.promisify(fs.readFile);
const fsMkdirPromise = util.promisify(fs.mkdir);
const fsUnlinkPromise = util.promisify(fs.unlink);
const fsRmPromise = util.promisify(fs.rm);
const fsReadDirPromise = util.promisify(fs.readdir);

const GITHUB_URL = 'https://github.com';
const GITHUB_REPOSITORY_REGEX = /^https:\/\/github.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/i;

function isValidRepositoryUrl(repositoryUrl: string) {
  return GITHUB_REPOSITORY_REGEX.test(repositoryUrl);
}

function extractRepositoryOwnerAndName(pluginUrl: string) {
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

function extractInfoFromPackageJson(packageJson: PackageJsonMonoklePlugin) {
  const {name, version, author, description, monoklePlugin} = packageJson;
  if (name === undefined || version === undefined || author === undefined || monoklePlugin === undefined) {
    throw new Error('Invalid plugin package.json');
  }
  return {name, version, author, description, monoklePlugin};
}

async function fetchPackageJson(repositoryOwner: string, repositoryName: string, targetCommitish: string) {
  const packageJsonUrl = `https://raw.githubusercontent.com/${repositoryOwner}/${repositoryName}/${targetCommitish}/package.json`;
  const packageJsonResponse = await fetch(packageJsonUrl);
  if (!packageJsonResponse.ok) {
    throw new Error("Couldn't find package.json file in the repository");
  }
  const packageJson = await packageJsonResponse.json();
  return packageJson as PackageJsonMonoklePlugin;
}

export async function downloadPlugin(pluginUrl: string, pluginsDir: string) {
  const {repositoryOwner, repositoryName} = extractRepositoryOwnerAndName(pluginUrl);
  const repositoryBranch = 'main'; // TODO: allow input of branch name
  const packageJson = await fetchPackageJson(repositoryOwner, repositoryName, repositoryBranch);
  const pluginInfo = extractInfoFromPackageJson(packageJson);
  const doesPluginsDirExist = await fsExistsPromise(pluginsDir);
  if (!doesPluginsDirExist) {
    await fsMkdirPromise(pluginsDir);
  }

  const pluginTarballFilePath = path.join(
    pluginsDir,
    `${repositoryOwner}-${repositoryName}-${pluginInfo.version.replace('.', '-')}.tgz`
  );
  if (fs.existsSync(pluginTarballFilePath)) {
    await fsUnlinkPromise(pluginTarballFilePath);
  }
  const pluginTarballUrl = `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/tarball/${repositoryBranch}`;
  await downloadFile(pluginTarballUrl, pluginTarballFilePath);

  const pluginFolderPath: string = path.join(pluginsDir, `${repositoryOwner}-${repositoryName}`);

  if (fs.existsSync(pluginFolderPath)) {
    await fsRmPromise(pluginFolderPath, {recursive: true});
  }

  await fsMkdirPromise(pluginFolderPath);

  await tar.extract({
    file: pluginTarballFilePath,
    cwd: pluginFolderPath,
    strip: 1,
  });

  const plugin: MonoklePlugin = {
    name: pluginInfo.name,
    author: typeof pluginInfo.author === 'string' ? pluginInfo.author : pluginInfo.author.name,
    version: pluginInfo.version,
    description: pluginInfo.description,
    isActive: false,
    repository: {
      owner: repositoryOwner,
      name: repositoryName,
      branch: repositoryBranch,
    },
    modules: pluginInfo.monoklePlugin.modules,
  };

  return plugin;
}

const getSubfolders = async (folderPath: string) => {
  const subfolders = await fsReadDirPromise(folderPath, {withFileTypes: true});
  return subfolders.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
};

async function parsePlugin(pluginsDir: string, pluginFolderName: string): Promise<MonoklePlugin | undefined> {
  const pluginFolderPath = path.join(pluginsDir, pluginFolderName);
  const packageJsonFilePath = path.join(pluginFolderPath, 'package.json');
  const doesPackageJsonFileExist = await fsExistsPromise(packageJsonFilePath);
  if (!doesPackageJsonFileExist) {
    log.warn(`[Plugins]: Missing package.json for plugin ${pluginFolderPath}`);
    return;
  }
  const packageJsonRaw = await fsReadFilePromise(packageJsonFilePath, 'utf8');
  const packageJson = JSON.parse(packageJsonRaw) as PackageJson;
  const pluginInfo = extractInfoFromPackageJson(packageJson);

  if (!packageJson.repository) {
    log.warn(`[Plugins]: Missing 'repository' property in ${packageJsonFilePath}`);
    return;
  }

  const {repositoryOwner, repositoryName} = extractRepositoryOwnerAndName(
    typeof packageJson.repository === 'string' ? packageJson.repository : packageJson.repository.url
  );

  return {
    name: pluginInfo.name,
    author: typeof pluginInfo.author === 'string' ? pluginInfo.author : pluginInfo.author.name,
    version: pluginInfo.version,
    description: pluginInfo.description,
    isActive: false,
    repository: {
      owner: repositoryOwner,
      name: repositoryName,
      branch: 'main', // TODO: handle the branch name
    },
    modules: pluginInfo.monoklePlugin.modules,
  };
}

export async function loadPlugins(pluginsDir: string) {
  const pluginFolders = await getSubfolders(pluginsDir);

  const pluginsParsingResults = await Promise.allSettled(
    pluginFolders.map(pluginFolderName => parsePlugin(pluginsDir, pluginFolderName))
  );

  const plugins = pluginsParsingResults
    .filter((r): r is {status: 'fulfilled'; value: MonoklePlugin} => r.status === 'fulfilled' && r.value !== undefined)
    .map(r => r.value);

  return plugins;
}
