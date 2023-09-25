import {createAsyncThunk} from '@reduxjs/toolkit';

import fs from 'fs';
import {sortBy} from 'lodash';
import path from 'path';
import {v4 as uuid} from 'uuid';

import {setAlert} from '@redux/reducers/alert';
import {extractK8sResources} from '@redux/services/resource';
import {createRejectionWithAlert} from '@redux/thunks/utils';

import {buildHelmConfigCommand} from '@utils/helm';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AlertEnum} from '@shared/models/alert';
import {AppDispatch} from '@shared/models/appDispatch';
import {CommandOptions} from '@shared/models/commands';
import {HelmPreviewConfiguration, PreviewConfigValuesFileItem} from '@shared/models/config';
import {K8sResource} from '@shared/models/k8sResource';
import {HelmConfigPreview} from '@shared/models/preview';
import {RootState} from '@shared/models/rootState';
import {selectKubeconfig} from '@shared/utils/cluster/selectors';
import {runCommandInMainThread} from '@shared/utils/commands';
import {trackEvent} from '@shared/utils/telemetry';

/**
 * Thunk to preview a Helm Chart
 */

export const runPreviewConfiguration = createAsyncThunk<
  | {
      resources: K8sResource<'preview'>[];
      preview: HelmConfigPreview;
    }
  | undefined,
  {
    helmConfigId: string;
    performDeploy?: boolean;
    selectedNamespace?: string;
    shouldCreateNamespace?: boolean;
  },
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/runPreviewConfiguration', async (props, thunkAPI) => {
  const {helmConfigId, performDeploy, selectedNamespace, shouldCreateNamespace} = props;
  const startTime = new Date().getTime();
  const configState = thunkAPI.getState().config;
  const mainState = thunkAPI.getState().main;
  const previewConfigurationMap = configState.projectConfig?.helm?.previewConfigurationMap;
  const kubeconfig = selectKubeconfig(thunkAPI.getState());

  if (!kubeconfig?.isValid) {
    return createRejectionWithAlert(
      thunkAPI,
      'Helm Configuration Error',
      `Could not preview due to invalid kubeconfig`
    );
  }

  const rootFolderPath = mainState.fileMap[ROOT_FILE_ENTRY].filePath;

  let previewConfiguration: HelmPreviewConfiguration | null | undefined;
  if (previewConfigurationMap) {
    previewConfiguration = previewConfigurationMap[helmConfigId];
  }
  if (!previewConfiguration) {
    return createRejectionWithAlert(
      thunkAPI,
      'Helm Configuration Error',
      `Could not find the Helm Configuration with id ${helmConfigId}`
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

  trackEvent('preview/helm_config/start', {isInstall: Boolean(performDeploy)});

  const args = buildHelmConfigCommand(
    chart,
    orderedValuesFilePaths,
    previewConfiguration.command,
    previewConfiguration.options,
    rootFolderPath,
    performDeploy
  );

  const commandOptions: CommandOptions = {
    commandId: uuid(),
    cmd: 'helm',
    args: args.splice(1),
    env: {KUBECONFIG: kubeconfig.path},
  };

  if (selectedNamespace) {
    if (!commandOptions.args.some(arg => arg.includes('--namespace'))) {
      commandOptions.args.push(...['--namespace', selectedNamespace]);
    }

    if (shouldCreateNamespace && !commandOptions.args.some(arg => arg.includes('--create-namespace'))) {
      commandOptions.args.push('--create-namespace');
    }
  }

  const result = await runCommandInMainThread(commandOptions);

  if (result.error || result.stderr) {
    trackEvent('preview/helm_config/fail', {reason: result.error || result.stderr || 'unknown'});
    return createRejectionWithAlert(thunkAPI, 'Helm Error', `${result.error} - ${result.stderr}`);
  }

  const endTime = new Date().getTime();
  trackEvent('preview/helm_config/end', {executionTime: endTime - startTime});

  if (performDeploy) {
    thunkAPI.dispatch(
      setAlert({
        type: AlertEnum.Success,
        title: 'Installed Helm Chart',
        message: `Successfully installed the ${chart.name} Helm Chart using the ${previewConfiguration.name} configuration!`,
      })
    );
    // If we are performing a deploy, we don't want to return any resources or preview
    return;
  }

  if (result.stdout) {
    const preview: HelmConfigPreview = {type: 'helm-config', configId: previewConfiguration.id};

    const resources = extractK8sResources(result.stdout, 'preview', {
      preview,
    });

    trackEvent('preview/helm_config/end', {resourcesCount: resources.length, executionTime: endTime - startTime});

    return {
      resources,
      preview,
    };
  }

  return createRejectionWithAlert(
    thunkAPI,
    'Helm Error',
    `Unable to run Helm with Dry-run Configuration: ${previewConfiguration.name} - [${result.stderr}]`
  );
});
