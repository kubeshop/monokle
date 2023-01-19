import {app} from 'electron';

import log from 'loglevel';
import {machineIdSync} from 'node-machine-id';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

import terminal from '@root/cli/terminal';
import {init as sentryInit} from '@sentry/electron/main';
import electronStore from '@shared/utils/electronStore';
import '@shared/utils/segment';

import './git/ipc';
import './ipc/ipcListeners';
import {openApplication} from './openApplication';
import {initTelemetry, saveInitialK8sSchema, setProjectsRootFolder} from './utils';
import {fixPath} from './utils/path';

const userHomeDir = app.getPath('home');
const userDataDir = app.getPath('userData');

const disableEventTracking = Boolean(electronStore.get('appConfig.disableEventTracking'));

if (process.env.SENTRY_DSN) {
  sentryInit({
    dsn: process.env.SENTRY_DSN,
    beforeSend: event => {
      const disableErrorReporting = Boolean(electronStore.get('appConfig.disableErrorReporting'));
      if (disableErrorReporting) {
        return null;
      }
      return event;
    },
  });
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
