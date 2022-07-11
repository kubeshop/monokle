import {createAsyncThunk} from '@reduxjs/toolkit';

import {AppDispatch} from '@models/appdispatch';
import {RootState} from '@models/rootstate';

import {SetPreviewDataPayload} from '@redux/reducers/main';
import {currentConfigSelector} from '@redux/selectors';
import {fetchResources} from '@redux/services/compare/fetchResources';
import {getK8sVersion} from '@redux/services/projectConfig';
import {createPreviewResultFromResources, createRejectionWithAlert} from '@redux/thunks/utils';

import {errorMsg} from '@utils/error';

import {DO_HELM_PREVIEW, trackEvent} from '@shared/telemetry';

export const previewHelmValuesFile = createAsyncThunk<
  SetPreviewDataPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/previewHelmValuesFile', async (valuesFileId, thunkAPI) => {
  try {
    trackEvent(DO_HELM_PREVIEW);

    const state = thunkAPI.getState().main;
    const configState = thunkAPI.getState().config;

    const valuesFile = state.helmValuesMap[valuesFileId];
    if (!valuesFile) {
      throw new Error('Values not found');
    }

    const resources = await fetchResources(thunkAPI.getState(), {
      type: 'helm',
      chartId: valuesFile.helmChartId,
      valuesId: valuesFile.id,
    });

    const projectConfig = currentConfigSelector(thunkAPI.getState());
    const policyPlugins = state.policies.plugins;

    return createPreviewResultFromResources(
      getK8sVersion(projectConfig),
      String(configState.userDataDir),
      resources,
      valuesFile.id,
      'Helm Preview',
      state.resourceRefsProcessingOptions,
      undefined,
      undefined,
      {policyPlugins}
    );
  } catch (err) {
    return createRejectionWithAlert(thunkAPI, 'Helm Error', errorMsg(err));
  }
});
