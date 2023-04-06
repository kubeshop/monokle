import {createAsyncThunk} from '@reduxjs/toolkit';

import {cloneDeep} from 'lodash';

import {updateProjectConfig} from '@redux/appConfig';
import {clearSelection, selectFile} from '@redux/reducers/main';

import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';

export const deletePreviewConfiguration = createAsyncThunk<void, string, {dispatch: AppDispatch; state: RootState}>(
  'main/deletePreviewConfiguration',
  async (previewConfigurationId, thunkAPI) => {
    const state = thunkAPI.getState();

    const previewConfigurationMap = state.config.projectConfig?.helm?.previewConfigurationMap;
    if (!previewConfigurationMap) {
      return;
    }

    if (state.main.preview?.type === 'helm-config' && state.main.preview.configId === previewConfigurationId) {
      const previewConfiguration = previewConfigurationMap[previewConfigurationId];
      const helmChartFilePath = previewConfiguration?.helmChartFilePath;
      if (helmChartFilePath) {
        thunkAPI.dispatch(selectFile({filePath: helmChartFilePath}));
      } else {
        thunkAPI.dispatch(clearSelection());
      }
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
