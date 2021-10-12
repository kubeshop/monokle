import path from 'path';
import fetch from 'node-fetch';
import fs from 'fs';
import util from 'util';
import tar from 'tar';
import {PackageJsonMonoklePlugin} from '@models/plugin';
import {downloadFile} from '@utils/http';

const fsExistsPromise = util.promisify(fs.exists);
const fsMkdirPromise = util.promisify(fs.mkdir);

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

function extractPluginInfo(packageJson: PackageJsonMonoklePlugin) {
  const {name, version, author, description, monoklePlugin} = packageJson;
  if (name === undefined || version === undefined || author === undefined || monoklePlugin === undefined) {
    throw new Error('Invalid plugin package.json');
  }
  return {name, version, author, description, monoklePlugin};
}

async function fetchLatestRelease(repositoryOwner: string, repositoryName: string) {
  const latestReleaseUrl = `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/releases/latest`;
  const latestReleaseResponse = await fetch(latestReleaseUrl);
  const latestReleaseJson: any = await latestReleaseResponse.json();
  const targetCommitish = latestReleaseJson?.target_commitish;
  const tarballUrl = latestReleaseJson?.tarball_url;
  const tagName = latestReleaseJson?.tag_name;
  if (typeof targetCommitish !== 'string' || typeof tarballUrl !== 'string' || typeof tagName !== 'string') {
    throw new Error("Couldn't fetch the latest release of the plugin.");
  }
  return {targetCommitish, tarballUrl, tagName};
}

async function fetchPackageJson(repositoryOwner: string, repositoryName: string, targetCommitish: string) {
  const packageJsonUrl = `https://raw.githubusercontent.com/${repositoryOwner}/${repositoryName}/${targetCommitish}/package.json`;
  const packageJsonResponse = await fetch(packageJsonUrl);
  if (!packageJsonResponse.ok) {
    throw new Error("Couldn't fetch package.json");
  }
  const packageJson = await packageJsonResponse.json();
  return packageJson as PackageJsonMonoklePlugin;
}

async function fetchLatestReleaseCommitSha(repositoryOwner: string, repositoryName: string, tagName: string) {
  const refTagUrl = `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/git/ref/tags/${tagName}`;
  const refTagResponse = await fetch(refTagUrl);
  if (!refTagResponse.ok) {
    throw new Error("Couldn't fetch git ref tag.");
  }
  const refTagJson: any = await refTagResponse.json();

  let commitSha: string | undefined;
  if (typeof refTagJson?.object?.type !== 'string' || typeof refTagJson?.object?.sha !== 'string') {
    throw new Error("Couldn't find the ref tag object.");
  }

  if (refTagJson.object.type === 'commit') {
    commitSha = refTagJson.object.sha;
  } else {
    const tagUrl = `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/git/tags/${refTagJson.object.sha}`;
    const tagResponse = await fetch(tagUrl);
    const tagJson: any = tagResponse.json();
    if (tagJson?.object && typeof tagJson?.object?.sha === 'string') {
      commitSha = tagJson.object.sha;
    }
  }

  if (commitSha === undefined) {
    throw new Error("Couldn't find the commit sha of the latest release.");
  }
  return commitSha;
}

export async function downloadPlugin(pluginUrl: string, pluginsDir: string) {
  const {repositoryOwner, repositoryName} = extractRepositoryOwnerAndName(pluginUrl);
  const {targetCommitish, tarballUrl, tagName} = await fetchLatestRelease(repositoryOwner, repositoryName);
  const packageJson = await fetchPackageJson(repositoryOwner, repositoryName, targetCommitish);
  const commitSha = await fetchLatestReleaseCommitSha(repositoryOwner, repositoryName, tagName);
  const pluginInfo = extractPluginInfo(packageJson);
  const doesPluginsDirExist = await fsExistsPromise(pluginsDir);
  if (!doesPluginsDirExist) {
    await fsMkdirPromise(pluginsDir);
  }
  const pluginFolderPath: string = path.join(pluginsDir, `${repositoryOwner}-${repositoryName}`);
  if (!fs.existsSync(pluginFolderPath)) {
    await fsMkdirPromise(pluginFolderPath);
  }
  const pluginTarballFilePath = path.join(pluginFolderPath, `${commitSha}.tgz`);
  const pluginCommitShaFolder: string = path.join(pluginFolderPath, commitSha);
  if (fs.existsSync(pluginTarballFilePath) || fs.existsSync(pluginCommitShaFolder)) {
    throw new Error('Plugin already exists.');
  }
  await downloadFile(tarballUrl, pluginTarballFilePath);
  await fsMkdirPromise(pluginCommitShaFolder);
  await tar.extract({
    file: pluginTarballFilePath,
    cwd: pluginCommitShaFolder,
    strip: 1,
  });
}
