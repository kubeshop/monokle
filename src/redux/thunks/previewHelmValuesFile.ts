import {createAsyncThunk} from '@reduxjs/toolkit';

import {fetchResources} from '@redux/services/compare/fetchResources';
import {createRejectionWithAlert} from '@redux/thunks/utils';

import {errorMsg} from '@utils/error';

import {AppDispatch} from '@shared/models/appDispatch';
import {K8sResource} from '@shared/models/k8sResource';
import {HelmPreview} from '@shared/models/preview';
import {RootState} from '@shared/models/rootState';
import {trackEvent} from '@shared/utils/telemetry';

export const previewHelmValuesFile = createAsyncThunk<
  {
    resources: K8sResource<'preview'>[];
    preview: HelmPreview;
  },
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/previewHelmValuesFile', async (valuesFileId, thunkAPI) => {
  try {
    const startTime = new Date().getTime();
    const state = thunkAPI.getState().main;

    trackEvent('preview/helm/start');

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

    trackEvent('preview/helm/end', {resourcesCount: resources.length, executionTime: endTime - startTime});

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
