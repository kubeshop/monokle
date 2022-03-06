import {dialog} from 'electron';

import {AnyAction} from '@reduxjs/toolkit';

import {execSync} from 'child_process';
import {existsSync, mkdirSync, writeFileSync} from 'fs';
import _ from 'lodash';
import log from 'loglevel';
import {machineIdSync} from 'node-machine-id';
import Nucleus from 'nucleus-nodejs';
import path, {join} from 'path';

import {PREDEFINED_K8S_VERSION} from '@constants/constants';

import {AnyExtension} from '@models/extension';

import {createProject} from '@redux/reducers/appConfig';
import {loadResource} from '@redux/services';

import electronStore from '@utils/electronStore';

const GITHUB_URL = 'https://github.com';
const GITHUB_REPOSITORY_REGEX = /^https:\/\/github.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/i;

export function isValidRepositoryUrl(repositoryUrl: string) {
  return GITHUB_REPOSITORY_REGEX.test(repositoryUrl);
}

export function extractRepositoryOwnerAndNameFromUrl(pluginUrl: string) {
  if (!isValidRepositoryUrl(pluginUrl)) {
    throw new Error('Invalid repository URL');
  }
  const repositoryPath = pluginUrl.split(`${GITHUB_URL}/`)[1];
  const [repositoryOwner, repositoryName] = repositoryPath.split('/');

  return {
    repositoryOwner,
    repositoryName,
  };
}

export function makeExtensionDownloadData(
  extensionRepositoryUrl: string,
  extensionEntryFileName: string,
  downloadPath: string
) {
  const {repositoryOwner, repositoryName} = extractRepositoryOwnerAndNameFromUrl(extensionRepositoryUrl);
  const entryFileUrl = `https://raw.githubusercontent.com/${repositoryOwner}/${repositoryName}/main/${extensionEntryFileName}`;
  const tarballUrl = `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/tarball/main`;
  const folderPath = path.join(downloadPath, `${repositoryOwner}-${repositoryName}`);
  return {entryFileUrl, tarballUrl, folderPath};
}

export function convertExtensionsToRecord<ExtensionType>(
  extensions: AnyExtension<ExtensionType>[]
): Record<string, ExtensionType> {
  return extensions.reduce((acc: Record<string, ExtensionType>, current) => {
    const {folderPath, extension} = current;
    if (extension) {
      acc[folderPath] = extension;
    }
    return acc;
  }, {});
}

export const convertRecentFilesToRecentProjects = (dispatch: (action: AnyAction) => void) => {
  const recentFolders: string[] = electronStore.get('appConfig.recentFolders');

  if (recentFolders && recentFolders.length > 0) {
    recentFolders.forEach((folder: string) => {
      dispatch(createProject({rootFolder: folder}));
    });
    electronStore.delete('appConfig.recentFolders');
  }
};

export const setProjectsRootFolder = (userHomeDir: string) => {
  const projectsRootPath: string = electronStore.get('appConfig.projectsRootPath');

  if (!projectsRootPath) {
    electronStore.set('appConfig.projectsRootPath', path.join(userHomeDir, 'Monokle'));
  }
};

export const setDeviceID = (deviceID: string) => {
  const ID: string = electronStore.get('main.deviceID');

  if (!ID) {
    electronStore.set('main.deviceID', deviceID);
  }
};

export const getSerializedProcessEnv = () => {
  const serializedProcessEnv: Record<string, string> = {};
  const processEnv = _.isObject(process.env) ? process.env : {};
  Object.entries(processEnv).forEach(([key, value]) => {
    if (typeof value === 'string') {
      serializedProcessEnv[key] = value;
      return;
    }
    try {
      const serializedValue: string = JSON.stringify(value);
      serializedProcessEnv[key] = serializedValue;
    } catch {
      // do nothing
    }
  });
  try {
    return JSON.stringify(serializedProcessEnv);
  } catch {
    return undefined;
  }
};

export const saveInitialK8sSchema = (userDataDir: string) => {
  const dirName = join(String(userDataDir), path.sep, 'schemas');
  const schemaPath = join(dirName, path.sep, `${PREDEFINED_K8S_VERSION}.json`);

  if (!existsSync(dirName)) {
    mkdirSync(dirName, {recursive: true});
  }

  if (!existsSync(schemaPath)) {
    const data = loadResource(`schemas/${PREDEFINED_K8S_VERSION}.json`);
    writeFileSync(schemaPath, String(data));
  }
};

export function askActionConfirmation({
  action,
  unsavedResourceCount,
}: {
  action: string;
  unsavedResourceCount: number;
}): boolean {
  if (unsavedResourceCount === 0) {
    return true;
  }

  const shortAction = _.capitalize(action.split(' ')[0]);
  const message =
    unsavedResourceCount === 1 ? 'You have an unsaved resource' : `You have ${unsavedResourceCount} unsaved resources`;

  const choice = dialog.showMessageBoxSync({
    type: 'info',
    title: 'Confirmation',
    message,
    detail: `Progress will be lost if you choose to ${action}. You can't undo this action.`,
    buttons: [shortAction, 'Cancel'],
    defaultId: 0,
    cancelId: 1,
  });

  return choice === 0;
}

export const checkMissingDependencies = (dependencies: Array<string>): Array<string> => {
  log.info(`checking dependencies with process path: ${process.env.PATH}`);

  return dependencies.filter(d => {
    try {
      execSync(d, {
        env: process.env,
        windowsHide: true,
      });
      return false;
    } catch (e: any) {
      return true;
    }
  });
};


export const initNucleus = (isDev: boolean, app: any) => {
  Nucleus.init(process.env.NUCLEUS_SH_APP_ID || '6218cf3ef5e5d2023724d89b', {
    disableInDev: false,
    disableTracking: Boolean(electronStore.get('appConfig.disableEventTracking')),
    disableErrorReports: true,
    debug: false,
  });

  Nucleus.setUserId(machineIdSync());

  Nucleus.setProps(
    {
      os: process.platform,
      version: app.getVersion(),
      language: app.getLocale(),
    },
    true
  );

  return {
    disableTracking: Boolean(electronStore.get('appConfig.disableEventTracking')),
    disableErrorReports: Boolean(electronStore.get('appConfig.disableErrorReporting')),
  };
};
