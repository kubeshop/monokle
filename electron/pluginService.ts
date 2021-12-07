import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import tar from 'tar';
import util from 'util';

import {PackageJsonMonoklePlugin} from '@models/plugin';

import {downloadFile} from '@utils/http';

const fsExistsPromise = util.promisify(fs.exists);
const fsMkdirPromise = util.promisify(fs.mkdir);
const fsUnlinkPromise = util.promisify(fs.unlink);
const fsRmPromise = util.promisify(fs.rm);

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
}
