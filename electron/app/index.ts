import {app} from 'electron';

import {machineIdSync} from 'node-machine-id';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

import {init as sentryInit} from '@sentry/electron/main';
import electronStore from '@shared/utils/electronStore';
import '@shared/utils/segment';

import './ipc/ipcListeners';
import {openApplication} from './openApplication';
import './services/git/ipc';
import {initTelemetry, saveInitialK8sSchema, setProjectsRootFolder} from './utils';
import {fixPath} from './utils/path';

const userHomeDir = app.getPath('home');
const userDataDir = app.getPath('userData');
// Bottom 2 lines prevent SSL errors that throws from browser
app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch('ignore-ssl-errors');

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
