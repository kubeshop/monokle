import {dialog} from 'electron';
import log from 'electron-log';

import {AnyAction} from '@reduxjs/toolkit';

import {spawnSync} from 'child_process';
import {existsSync, mkdirSync, writeFileSync} from 'fs';
import gitUrlParse from 'git-url-parse';
import _ from 'lodash';
import os from 'os';
import path, {join} from 'path';
import semver from 'semver';

import {PREDEFINED_K8S_VERSION} from '@shared/constants/k8s';
import type {AnyExtension} from '@shared/models/extension';
import {APP_DOWNGRADED, APP_INSTALLED, APP_SESSION, APP_UPDATED} from '@shared/models/telemetry';
import electronStore from '@shared/utils/electronStore';
import {loadResource} from '@shared/utils/resource';
import {getSegmentClient} from '@shared/utils/segment';

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
      dispatch({type: 'config/createProject', payload: {rootFolder: folder}});
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

export const initTelemetry = (deviceID: string, disableEventTracking: boolean, app: Electron.App) => {
  const storedDeviceID: string | undefined = electronStore.get('main.deviceID');
  const segmentClient = getSegmentClient();

  let lastSessionVersion = electronStore.get('appConfig.lastSessionVersion');

  if (!lastSessionVersion) {
    lastSessionVersion = app.getVersion();
    electronStore.set('appConfig.lastSessionVersion', lastSessionVersion);
  }

  if (!disableEventTracking) {
    log.info('New Session.');
    segmentClient?.track({
      event: APP_SESSION,
      userId: deviceID,
      properties: {
        appVersion: app.getVersion(),
      },
    });

    if (semver.lt(lastSessionVersion, app.getVersion())) {
      log.info('Application Updated.');
      segmentClient?.track({
        event: APP_UPDATED,
        userId: deviceID,
        properties: {
          oldVersion: lastSessionVersion,
          newVersion: app.getVersion(),
        },
      });
    }

    if (semver.gt(lastSessionVersion, app.getVersion())) {
      log.info('Application Downgraded.');
      segmentClient?.track({
        event: APP_DOWNGRADED,
        userId: deviceID,
        properties: {
          oldVersion: lastSessionVersion,
          newVersion: app.getVersion(),
        },
      });
    }
  }

  electronStore.set('appConfig.lastSessionVersion', app.getVersion());

  if (!storedDeviceID) {
    log.info('New Installation.');
    segmentClient?.identify({
      userId: deviceID,
    });
    segmentClient?.track({
      event: APP_INSTALLED,
      userId: deviceID,
      properties: {
        appVersion: app.getVersion(),
        deviceOS: os.platform(),
        deviceLocale: app.getLocale(),
      },
    });
    electronStore.set('main.deviceID', deviceID);
    electronStore.set('main.firstTimeRunTimestamp', Date.now());
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

// will calculate the minutes that passed from the first time the app was run

export function calculateMinutesPassed(firstTimeRunTimestamp: number): number {
  if (!firstTimeRunTimestamp) {
    return -1;
  }

  const currentTimeInMillis = Date.now();
  const minutesPassed = Math.floor((currentTimeInMillis - firstTimeRunTimestamp) / (1000 * 60));
  return minutesPassed;
}
