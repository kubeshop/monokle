import {createAsyncThunk} from '@reduxjs/toolkit';

import fs from 'fs';
import log from 'loglevel';
import path from 'path';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {AppDispatch} from '@models/appdispatch';
import {RootState} from '@models/rootstate';

import {SetPreviewDataPayload} from '@redux/reducers/main';
import {currentConfigSelector} from '@redux/selectors';
import {getK8sVersion} from '@redux/services/projectConfig';
import {createPreviewResult, createRejectionWithAlert} from '@redux/thunks/utils';

import {CommandOptions, runCommandInMainThread} from '@utils/command';
import {DO_HELM_PREVIEW, trackEvent} from '@utils/telemetry';

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
  const projectConfig = currentConfigSelector(thunkAPI.getState());
  const kubeconfig = projectConfig.kubeConfig?.path;
  const currentContext = projectConfig.kubeConfig?.currentContext;
  const valuesFile = state.helmValuesMap[valuesFileId];
  const policyPlugins = state.policies.plugins;

  if (kubeconfig && valuesFile && valuesFile.filePath && currentContext) {
    const rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
    const chart = state.helmChartMap[valuesFile.helmChartId];
    const folder = path.join(rootFolder, path.dirname(chart.filePath));

    // sanity check
    if (fs.existsSync(folder) && fs.existsSync(path.join(rootFolder, valuesFile.filePath))) {
      log.info(`previewing ${valuesFile.name} in folder ${folder} using ${configState.settings.helmPreviewMode} mode`);

      const helmPreviewMode = projectConfig.settings ? projectConfig.settings.helmPreviewMode : 'template';

      const options: CommandOptions = {
        cmd: 'helm',
        args:
          helmPreviewMode === 'template'
            ? ['template', '-f', `"${path.join(folder, valuesFile.name)}"`, chart.name, `"${folder}"`]
            : [
                'install',
                '--kube-context',
                currentContext,
                '-f',
                `"${path.join(folder, valuesFile.name)}"`,
                chart.name,
                `"${folder}"`,
                '--dry-run',
              ],
        env: {KUBECONFIG: kubeconfig},
      };

      const result = await runCommandInMainThread(options);

      trackEvent(DO_HELM_PREVIEW);

      if (result.error || result.stderr) {
        return createRejectionWithAlert(
          thunkAPI,
          'Helm Error',
          result.error || result.stderr || `Unknown error ${result.exitCode}`
        );
      }

      if (result.stdout) {
        return createPreviewResult(
          getK8sVersion(projectConfig),
          String(configState.userDataDir),
          result.stdout,
          valuesFile.id,
          'Helm Preview',
          state.resourceRefsProcessingOptions,
          undefined,
          undefined,
          {policyPlugins}
        );
      }

      return createRejectionWithAlert(thunkAPI, 'Helm Error', 'Helm returned no resources');
    }

    return createRejectionWithAlert(
      thunkAPI,
      'Helm Error',
      `Unabled to run Helm for ${valuesFile.name} in folder ${folder}`
    );
  }

  return {};
});
