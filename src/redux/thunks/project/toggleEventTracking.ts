import {ipcRenderer} from 'electron';

import {createAsyncThunk} from '@reduxjs/toolkit';

import {setEventTracking} from '@redux/appConfig';

import electronStore from '@shared/utils/electronStore';

export const toggleEventTracking = createAsyncThunk(
  'config/toggleEventTracking',
  async (disableEventTracking: boolean, thunkAPI: any) => {
    thunkAPI.dispatch(setEventTracking(disableEventTracking));
    electronStore.set('appConfig.disableEventTracking', disableEventTracking);
    ipcRenderer.invoke('analytics:toggleTracking', {disableEventTracking});
  }
);
