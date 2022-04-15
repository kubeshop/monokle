import {createAsyncThunk} from '@reduxjs/toolkit';

import {cloneDeep} from 'lodash';

import {AppDispatch} from '@models/appdispatch';
import {RootState} from '@models/rootstate';

import {updateProjectConfig} from '@redux/reducers/appConfig';
import {clearSelected, selectFile} from '@redux/reducers/main';

export const deletePreviewConfiguration = createAsyncThunk<void, string, {dispatch: AppDispatch; state: RootState}>(
  'main/deletePreviewConfiguration',
  async (previewConfigurationId, thunkAPI) => {
    const state = thunkAPI.getState();

    const previewConfigurationMap = state.config.projectConfig?.helm?.previewConfigurationMap;
    if (!previewConfigurationMap) {
      return;
    }

    if (state.main.selectedPreviewConfigurationId === previewConfigurationId) {
      const previewConfiguration = previewConfigurationMap[previewConfigurationId];
      const helmChartFilePath = previewConfiguration?.helmChartFilePath;
      if (helmChartFilePath) {
        thunkAPI.dispatch(selectFile({filePath: helmChartFilePath}));
      } else {
        thunkAPI.dispatch(clearSelected());
      }
    }

    const previewConfigurationMapCopy = cloneDeep(previewConfigurationMap);
    previewConfigurationMapCopy[previewConfigurationId] = null;

    const updatedHelmConfig = {
      helm: {
        previewConfigurationMap: previewConfigurationMapCopy,
      },
    };

    thunkAPI.dispatch(updateProjectConfig({config: updatedHelmConfig, fromConfigFile: false}));
  }
);
