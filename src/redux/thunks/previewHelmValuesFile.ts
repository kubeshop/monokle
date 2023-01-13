import {createAsyncThunk} from '@reduxjs/toolkit';

import {SetPreviewDataPayload} from '@redux/reducers/main';
import {currentConfigSelector} from '@redux/selectors';
import {fetchResources} from '@redux/services/compare/fetchResources';
import {getK8sVersion} from '@redux/services/projectConfig';
import {createRejectionWithAlert} from '@redux/thunks/utils';

import {errorMsg} from '@utils/error';

import {AppDispatch} from '@shared/models/appDispatch';
import {HelmPreview} from '@shared/models/preview';
import {RootState} from '@shared/models/rootState';
import {trackEvent} from '@shared/utils/telemetry';

export const previewHelmValuesFile = createAsyncThunk<
  SetPreviewDataPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/previewHelmValuesFile', async (valuesFileId, thunkAPI) => {
  try {
    const startTime = new Date().getTime();
    const state = thunkAPI.getState().main;

    const valuesFile = state.helmValuesMap[valuesFileId];
    if (!valuesFile) {
      throw new Error(`Values File with id ${valuesFileId} not found`);
    }

    const resources = await fetchResources(thunkAPI.getState(), {
      type: 'helm',
      chartId: valuesFile.helmChartId,
      valuesId: valuesFile.id,
    });

    const endTime = new Date().getTime();

    trackEvent('preview/helm', {resourcesCount: resources.length, executionTime: endTime - startTime});

    const preview: HelmPreview = {
      type: 'helm',
      chartId: valuesFile.helmChartId,
      valuesFileId: valuesFile.id,
    };

    return {
      resources,
      preview,
    };
  } catch (err) {
    return createRejectionWithAlert(thunkAPI, 'Helm Error', errorMsg(err));
  }
});
