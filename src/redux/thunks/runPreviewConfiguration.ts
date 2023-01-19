import {createAsyncThunk} from '@reduxjs/toolkit';

import fs from 'fs';
import {sortBy} from 'lodash';
import path from 'path';
import {v4 as uuid} from 'uuid';

import {SetPreviewDataPayload} from '@redux/reducers/main';
import {createPreviewResult, createRejectionWithAlert} from '@redux/thunks/utils';

import {buildHelmCommand} from '@utils/helm';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AppDispatch} from '@shared/models/appDispatch';
import {CommandOptions} from '@shared/models/commands';
import {HelmPreviewConfiguration, PreviewConfigValuesFileItem} from '@shared/models/config';
import {RootState} from '@shared/models/rootState';
import {runCommandInMainThread} from '@shared/utils/commands';
import {trackEvent} from '@shared/utils/telemetry';

/**
 * Thunk to preview a Helm Chart
 */

export const runPreviewConfiguration = createAsyncThunk<
  SetPreviewDataPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/runPreviewConfiguration', async (previewConfigurationId, thunkAPI) => {
  const startTime = new Date().getTime();
  const configState = thunkAPI.getState().config;
  const mainState = thunkAPI.getState().main;
  const previewConfigurationMap = configState.projectConfig?.helm?.previewConfigurationMap;
  const kubeconfig = configState.kubeConfig.path;
  const k8sVersion = configState.projectConfig?.k8sVersion;
  const userDataDir = configState.userDataDir;
  const currentContext = thunkAPI.getState().config.kubeConfig.currentContext;
  const policyPlugins = mainState.policies.plugins;

  const rootFolderPath = mainState.fileMap[ROOT_FILE_ENTRY].filePath;

  let previewConfiguration: HelmPreviewConfiguration | null | undefined;
  if (previewConfigurationMap) {
    previewConfiguration = previewConfigurationMap[previewConfigurationId];
  }
  if (!previewConfiguration) {
    return createRejectionWithAlert(
      thunkAPI,
      'Preview Configuration Error',
      `Could not find the Preview Configuration with id ${previewConfigurationId}`
    );
  }

  const chart = Object.values(mainState.helmChartMap).find(
    c => previewConfiguration && c.filePath === previewConfiguration.helmChartFilePath
  );

  let chartFolderPath: string | undefined;
  let chartFilePath: string | undefined;

  if (chart) {
    chartFilePath = path.join(rootFolderPath, chart.filePath);
    chartFolderPath = path.dirname(chart.filePath);
  }

  if (!chart || !chartFolderPath || !chartFilePath || !fs.existsSync(chartFilePath)) {
    return createRejectionWithAlert(
      thunkAPI,
      'Helm Error',
      `Could not find the Chart.yaml file at location: ${chartFilePath}`
    );
  }

  const orderedValuesFilePaths = sortBy(
    Object.values(previewConfiguration.valuesFileItemMap).filter(
      (item): item is PreviewConfigValuesFileItem => item != null && item.isChecked
    ),
    ['order']
  ).map(i => i.filePath);

  const valuesFilePathsNotFound: string[] = [];
  orderedValuesFilePaths.forEach(filePath => {
    const absoluteFilePath = path.join(rootFolderPath, filePath);
    if (!fs.existsSync(absoluteFilePath)) {
      valuesFilePathsNotFound.push(absoluteFilePath);
    }
  });

  if (valuesFilePathsNotFound.length > 0) {
    return createRejectionWithAlert(
      thunkAPI,
      'Helm Error',
      `Could not find the following Values files: ${valuesFilePathsNotFound.slice(0, -1).join(', ')}${
        valuesFilePathsNotFound[valuesFilePathsNotFound.length - 1]
      }`
    );
  }

  const args = buildHelmCommand(
    chart,
    orderedValuesFilePaths,
    previewConfiguration.command,
    previewConfiguration.options,
    rootFolderPath,
    currentContext
  );

  const commandOptions: CommandOptions = {
    commandId: uuid(),
    cmd: 'helm',
    args: args.splice(1),
    env: {KUBECONFIG: kubeconfig},
  };

  const result = await runCommandInMainThread(commandOptions);

  if (result.error) {
    return createRejectionWithAlert(thunkAPI, 'Helm Error', `${result.error} - ${result.stderr}`);
  }

  const endTime = new Date().getTime();

  trackEvent('preview/helm_preview_configuration', {executionTime: endTime - startTime});

  if (result.stdout) {
    return createPreviewResult(
      String(k8sVersion),
      String(userDataDir),
      result.stdout,
      previewConfiguration.id,
      'Helm Preview',
      mainState.resourceRefsProcessingOptions,
      undefined,
      undefined,
      {policyPlugins}
    );
  }

  return createRejectionWithAlert(
    thunkAPI,
    'Helm Error',
    `Unable to run Helm with Preview Configuration: ${previewConfiguration.name} - [${result.stderr}]`
  );
});
