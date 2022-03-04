import {createAsyncThunk} from '@reduxjs/toolkit';

import {cloneDeep} from 'lodash';

import {AppDispatch} from '@models/appdispatch';
import {RootState} from '@models/rootstate';

import {updateProjectConfig} from '@redux/reducers/appConfig';

export const deletePreviewConfiguration = createAsyncThunk<void, string, {dispatch: AppDispatch; state: RootState}>(
  'main/deletePreviewConfiguration',
  async (previewConfigurationId, thunkAPI) => {
    const state = thunkAPI.getState();

    const previewConfigurationMap = state.config.projectConfig?.helm?.previewConfigurationMap;
    if (!previewConfigurationMap) {
      return;
    }
    const previewConfigurationMapCopy = cloneDeep(previewConfigurationMap);
    delete previewConfigurationMapCopy[previewConfigurationId];

    const updatedHelmConfig = {
      helm: {
        previewConfigurationMap: previewConfigurationMapCopy,
      },
    };

    thunkAPI.dispatch(updateProjectConfig({config: updatedHelmConfig, fromConfigFile: false}));
  }
);
