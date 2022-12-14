import {electronStoreDefaults, electronStoreSchema} from '@shared/constants';

const ElectronStore = require('electron-store');

const electronStore = new ElectronStore({
  schema: electronStoreSchema,
  defaults: electronStoreDefaults,
});

export default electronStore;
