import {createAsyncThunk} from '@reduxjs/toolkit';

import fs from 'fs';
import log from 'loglevel';
import path from 'path';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {AppDispatch} from '@models/appdispatch';
import {RootState} from '@models/rootstate';

import {SetPreviewDataPayload} from '@redux/reducers/main';
import {currentConfigSelector} from '@redux/selectors';
import {createPreviewResult, createRejectionWithAlert} from '@redux/thunks/utils';

import {runHelm} from '@utils/helm';
import {trackEvent} from '@utils/telemetry';

/**
 * Thunk to preview a Helm Chart
 */

export const previewHelmValuesFile = createAsyncThunk<
  SetPreviewDataPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/previewHelmValuesFile', async (valuesFileId, thunkAPI) => {
  const configState = thunkAPI.getState().config;
  const state = thunkAPI.getState().main;
  const kubeconfig = configState.projectConfig?.kubeConfig?.path || configState.kubeConfig.path;
  const k8sVersion = configState.projectConfig?.k8sVersion;
  const userDataDir = configState.userDataDir;
  const currentContext =
    thunkAPI.getState().config.projectConfig?.kubeConfig?.currentContext ||
    thunkAPI.getState().config.kubeConfig.currentContext;
  const valuesFile = state.helmValuesMap[valuesFileId];

  if (valuesFile && valuesFile.filePath) {
    const rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
    const chart = state.helmChartMap[valuesFile.helmChartId];
    const folder = path.join(rootFolder, path.dirname(chart.filePath));

    // sanity check
    if (fs.existsSync(folder) && fs.existsSync(path.join(folder, valuesFile.name))) {
      log.info(`previewing ${valuesFile.name} in folder ${folder} using ${configState.settings.helmPreviewMode} mode`);

      const projectConfig = currentConfigSelector(thunkAPI.getState());
      const helmPreviewMode = projectConfig.settings ? projectConfig.settings.helmPreviewMode : 'template';

      const args = {
        helmCommand:
          helmPreviewMode === 'template'
            ? `helm template -f "${folder}${path.sep}${valuesFile.name}" ${chart.name} "${folder}"`
            : `helm install --kube-context ${currentContext} -f "${folder}${path.sep}${valuesFile.name}" ${chart.name} "${folder}" --dry-run`,
        kubeconfig,
      };

      const result = await runHelm(args);

      trackEvent('DO_HELM_PREVIEW');

      if (result.error) {
        return createRejectionWithAlert(thunkAPI, 'Helm Error', result.error);
      }

      if (result.stdout) {
        return createPreviewResult(
          String(k8sVersion),
          String(userDataDir),
          result.stdout,
          valuesFile.id,
          'Helm Preview',
          state.resourceRefsProcessingOptions
        );
      }
    }

    return createRejectionWithAlert(
      thunkAPI,
      'Helm Error',
      `Unabled to run Helm for ${valuesFile.name} in folder ${folder}`
    );
  }

  return {};
});
