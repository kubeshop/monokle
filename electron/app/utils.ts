import {dialog} from 'electron';

import {AnyAction} from '@reduxjs/toolkit';

import {spawnSync} from 'child_process';
import {existsSync, mkdirSync, writeFileSync} from 'fs';
import gitUrlParse from 'git-url-parse';
import _ from 'lodash';
import log from 'loglevel';
import fetch from 'node-fetch';
import {machineIdSync} from 'node-machine-id';
import Nucleus from 'nucleus-nodejs';
import os from 'os';
import path, {join} from 'path';

import {PREDEFINED_K8S_VERSION} from '@constants/constants';

import {AnyExtension} from '@models/extension';

import {createProject} from '@redux/reducers/appConfig';
import {loadResource} from '@redux/services';

import electronStore from '@utils/electronStore';
import {getSegmentClient} from '@utils/segment';
import {APP_INSTALLED} from '@utils/telemetry';

const {NUCLEUS_SH_APP_ID, MONOKLE_INSTALLS_URL} = process.env;

const GITHUB_REPOSITORY_REGEX = /^https:\/\/github.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/i;

export function isValidRepositoryUrl(repositoryUrl: string) {
  return GITHUB_REPOSITORY_REGEX.test(repositoryUrl);
}

export function extractRepositoryOwnerAndNameFromUrl(pluginUrl: string) {
  if (!isValidRepositoryUrl(pluginUrl)) {
    throw new Error('Currently we support only Github as provider');
  }
  const parsedURL = gitUrlParse(pluginUrl);
  if (!parsedURL.owner || !parsedURL.name) {
    throw new Error('Please enter a valid git URL!');
  }
  if (!parsedURL.protocols.includes('https')) {
    throw new Error('Currently we support only HTTPS protocol!');
  }
  if (parsedURL.filepathtype && parsedURL.filepathtype !== 'tree') {
    throw new Error('Please navigate main url of the branch!');
  }
  return {
    repositoryOwner: parsedURL.owner,
    repositoryName: parsedURL.name,
    repositoryBranch: !parsedURL.filepathtype
      ? 'main'
      : `${parsedURL.ref}${parsedURL.filepath ? `/${parsedURL.filepath}` : ''}`,
  };
}

export function makeExtensionDownloadData(
  extensionRepositoryUrl: string,
  extensionEntryFileName: string,
  downloadPath: string
) {
  const {repositoryOwner, repositoryName, repositoryBranch} =
    extractRepositoryOwnerAndNameFromUrl(extensionRepositoryUrl);
  const entryFileUrl = `https://raw.githubusercontent.com/${repositoryOwner}/${repositoryName}/${repositoryBranch}/${extensionEntryFileName}`;
  const tarballUrl = `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/tarball/${repositoryBranch}`;
  const folderPath = path.join(
    downloadPath,
    // @ts-ignore
    `${repositoryOwner}-${repositoryName}-${repositoryBranch.replaceAll(path.sep, '-')}`
  );
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

export const setDeviceID = (deviceID: string, disableTracking: boolean, appVersion: string) => {
  const storedDeviceID: string | undefined = electronStore.get('main.deviceID');
  const segmentClient = getSegmentClient();

  const requestArgs = {
    method: 'post',
    body: JSON.stringify({
      machineId: deviceID,
    }),
    headers: {'Content-Type': 'application/json'},
  };

  if (!disableTracking) {
    log.info('New Session.');
    fetch(`${MONOKLE_INSTALLS_URL}/session`, requestArgs);
    segmentClient?.track({
      event: 'APP_SESSION',
      userId: deviceID,
    });
  }

  if (!storedDeviceID) {
    log.info('New Installation.');
    if (NUCLEUS_SH_APP_ID) {
      Nucleus.track(APP_INSTALLED, {appVersion});
    }
    if (MONOKLE_INSTALLS_URL) {
      fetch(`${MONOKLE_INSTALLS_URL}/install`, requestArgs);
    }
    segmentClient?.identify({
      userId: deviceID,
    });
    segmentClient?.track({
      event: APP_INSTALLED,
      userId: deviceID,
      properties: {
        appVersion,
        deviceOS: os.platform(),
      },
    });
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
  if (!unsavedResourceCount) {
    return true;
  }

  let message: string = '';

  const shortAction = _.capitalize(action.split(' ')[0]);

  if (unsavedResourceCount) {
    message +=
      unsavedResourceCount === 1
        ? 'You have an unsaved resource.\n'
        : `You have ${unsavedResourceCount} unsaved resources.\n`;
  }

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
      const result = spawnSync(d, {
        env: process.env,
        shell: true,
        windowsHide: true,
      });
      return Boolean(result.error);
    } catch (e: any) {
      return true;
    }
  });
};

export const initNucleus = (isDev: boolean, app: any) => {
  if (NUCLEUS_SH_APP_ID) {
    Nucleus.init(NUCLEUS_SH_APP_ID, {
      disableInDev: isDev,
      disableTracking: Boolean(electronStore.get('appConfig.disableEventTracking')),
      disableErrorReports: true,
      debug: false,
    });

    // This has to run after Nucleus.init but before tracking any events.
    Nucleus.appStarted();

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
  }

  return {
    disableTracking: true,
    disableErrorReports: true,
  };
};
