import {AppImageUpdater, MacUpdater, NsisUpdater} from 'electron-updater';
import {GenericServerOptions} from 'electron-updater/node_modules/builder-util-runtime';

const options: GenericServerOptions = {
  provider: 'generic',
  url: 'https://github.com/kubeshop/monokle/releases/download/latest-version',
};

// eslint-disable-next-line import/no-mutable-exports
let autoUpdater: NsisUpdater | MacUpdater | AppImageUpdater;

if (process.platform === 'win32') {
  autoUpdater = new NsisUpdater(options);
} else if (process.platform === 'darwin') {
  autoUpdater = new MacUpdater(options);
} else {
  autoUpdater = new AppImageUpdater(options);
}
autoUpdater.logger = console;

export default autoUpdater;
