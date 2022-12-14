import {app} from 'electron';

import log from 'loglevel';
import {machineIdSync} from 'node-machine-id';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

import electronStore from '@utils/electronStore';
import {fixPath} from '@utils/path';
import '@utils/segment';

import terminal from '@root/cli/terminal';
import * as Sentry from '@sentry/electron';

import './git/ipc';
import './ipc/ipcListeners';
import {openApplication} from './openApplication';
import {initTelemetry, saveInitialK8sSchema, setProjectsRootFolder} from './utils';

const userHomeDir = app.getPath('home');
const userDataDir = app.getPath('userData');

const disableEventTracking = Boolean(electronStore.get('appConfig.disableEventTracking'));
const disableErrorReporting = Boolean(electronStore.get('appConfig.disableErrorReporting'));

if (process.env.ELECTRON_SENTRY_DSN && !disableErrorReporting) {
  Sentry.init({dsn: process.env.ELECTRON_SENTRY_DSN});
}

setProjectsRootFolder(userHomeDir);
saveInitialK8sSchema(userDataDir);
initTelemetry(machineIdSync(), disableEventTracking, app);
fixPath();

if (process.env.MONOKLE_RUN_AS_NODE) {
  yargs(hideBin(process.argv)).command(
    '$0',
    'opens current directory',
    () => {},
    async argv => {
      const {executedFrom} = argv;
      openApplication(executedFrom as string);
    }
  ).argv;
} else {
  openApplication();
}

terminal().catch(e => log.error(e));
