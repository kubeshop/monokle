import {createAsyncThunk} from '@reduxjs/toolkit';

import {cloneDeep} from 'lodash';

import {updateProjectConfig} from '@redux/appConfig';
import {clearSelection, selectFile} from '@redux/reducers/main';
import {stopPreview} from '@redux/services/preview';

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

      stopPreview(thunkAPI.dispatch);
    }

    if (
      state.main.selection?.type === 'preview.configuration' &&
      state.main.selection.previewConfigurationId === previewConfigurationId
    ) {
      thunkAPI.dispatch(clearSelection());
    }

    const previewConfigurationMapCopy = cloneDeep(previewConfigurationMap);
    previewConfigurationMapCopy[previewConfigurationId] = null;

    const projectConfig = state.config.projectConfig;

    thunkAPI.dispatch(
      updateProjectConfig({
        config: {
          ...projectConfig,
          helm: {
            previewConfigurationMap: previewConfigurationMapCopy,
          },
        },
        fromConfigFile: false,
      })
    );
  }
);
