import {electronStoreDefaults, electronStoreSchema} from '../constants/electronStore';

const ElectronStore = require('electron-store');

const electronStore = new ElectronStore({
  schema: electronStoreSchema,
  defaults: electronStoreDefaults,
});

export default electronStore;
