import {createAsyncThunk} from '@reduxjs/toolkit';

import fs from 'fs';
import log from 'loglevel';
import path from 'path';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {HelmPreviewConfiguration} from '@models/appconfig';
import {AppDispatch} from '@models/appdispatch';
import {RootState} from '@models/rootstate';

import {SetPreviewDataPayload} from '@redux/reducers/main';
import {createPreviewResult, createRejectionWithAlert} from '@redux/thunks/utils';

import {buildHelmCommand, runHelm} from '@utils/helm';

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
  const configState = thunkAPI.getState().config;
  const mainState = thunkAPI.getState().main;
  const previewConfigurationMap = configState.projectConfig?.helm?.previewConfigurationMap;
  const kubeconfig = configState.projectConfig?.kubeConfig?.path || configState.kubeConfig.path;
  const k8sVersion = configState.projectConfig?.k8sVersion;
  const userDataDir = configState.userDataDir;
  const currentContext =
    thunkAPI.getState().config.projectConfig?.kubeConfig?.currentContext ||
    thunkAPI.getState().config.kubeConfig.currentContext;

  const rootFolderPath = mainState.fileMap[ROOT_FILE_ENTRY].filePath;

  let previewConfiguration: HelmPreviewConfiguration | undefined;
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

  const valuesFilePathsNotFound: string[] = [];
  previewConfiguration.orderedValuesFilePaths.forEach(filePath => {
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

  log.info(`Running the following Preview Configuration: ${previewConfiguration.id}`);

  const helmCommand = buildHelmCommand(
    chart,
    previewConfiguration.orderedValuesFilePaths,
    previewConfiguration.command,
    previewConfiguration.options,
    rootFolderPath,
    currentContext
  );

  const args = {
    helmCommand,
    kubeconfig,
  };

  const result = await runHelm(args);

  if (result.error) {
    return createRejectionWithAlert(thunkAPI, 'Helm Error', result.error);
  }

  if (result.stdout) {
    return createPreviewResult(
      String(k8sVersion),
      String(userDataDir),
      result.stdout,
      previewConfiguration.id,
      'Helm Preview',
      mainState.resourceRefsProcessingOptions
    );
  }

  return createRejectionWithAlert(
    thunkAPI,
    'Helm Error',
    `Unable to run Helm with Preview Configuration: ${previewConfiguration.name}`
  );
});
