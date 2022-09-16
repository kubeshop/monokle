import {app} from 'electron';
import unhandled from 'electron-unhandled';

import log from 'loglevel';
import {machineIdSync} from 'node-machine-id';
import Nucleus from 'nucleus-nodejs';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

import {fixPath} from '@utils/path';
import '@utils/segment';

import '@electron/app/git/ipc';
import '@electron/app/ipc/ipcListeners';
import terminal from '@root/cli/terminal';
import {openApplication} from '@root/electron/app/openApplication';
import {initNucleus, saveInitialK8sSchema, setDeviceID, setProjectsRootFolder} from '@root/electron/app/utils';

const isDev = process.env.NODE_ENV === 'development';

const userHomeDir = app.getPath('home');
const userDataDir = app.getPath('userData');

let {disableErrorReports, disableTracking} = initNucleus(isDev, app);
unhandled({
  logger: error => {
    if (!disableErrorReports) {
      Nucleus.trackError((error && error.name) || 'Unnamed error', error);
    }
  },
  showDialog: false,
});

setProjectsRootFolder(userHomeDir);
saveInitialK8sSchema(userDataDir);
setDeviceID(machineIdSync(), disableTracking, app.getVersion());
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
