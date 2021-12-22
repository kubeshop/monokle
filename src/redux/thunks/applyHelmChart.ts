import {spawn} from 'child_process';
import log from 'loglevel';
import path from 'path';

import {AlertEnum, AlertType} from '@models/alert';
import {FileMapType} from '@models/appstate';
import {HelmChart, HelmValuesFile} from '@models/helm';

import {setAlert} from '@redux/reducers/alert';
import {setApplyingResource} from '@redux/reducers/main';
import {getAbsoluteHelmChartPath, getAbsoluteValuesFilePath} from '@redux/services/fileEntry';
import {AppDispatch} from '@redux/store';

import {PROCESS_ENV} from '@utils/env';
import {getShellPath} from '@utils/shell';

/**
 * Invokes helm install for the specified helm chart and values file
 */

function applyHelmChartToCluster(
  valuesFile: HelmValuesFile,
  helmChart: HelmChart,
  fileMap: FileMapType,
  kubeconfig: string,
  context: string,
  namespace?: string,
  shouldCreateNamespace?: boolean
) {
  const chartPath = path.dirname(getAbsoluteHelmChartPath(helmChart, fileMap));

  let helmArgs = [
    'install',
    '-f',
    getAbsoluteValuesFilePath(valuesFile, fileMap),
    helmChart.name,
    chartPath,
    '--kube-context',
    context,
  ];

  if (namespace) {
    helmArgs.push(...['--namespace', namespace]);

    if (shouldCreateNamespace) {
      helmArgs.push('--create-namespace');
    }
  }

  const child = spawn('helm', helmArgs, {
    env: {
      NODE_ENV: PROCESS_ENV.NODE_ENV,
      PUBLIC_URL: PROCESS_ENV.PUBLIC_URL,
      PATH: getShellPath(),
      KUBECONFIG: kubeconfig,
    },
  });

  return child;
}

/**
 * applies the specified helm chart / values file
 *
 * this isn't actually a Thunk - but should be in the future!
 */

export async function applyHelmChart(
  valuesFile: HelmValuesFile,
  helmChart: HelmChart,
  fileMap: FileMapType,
  dispatch: AppDispatch,
  kubeconfig: string,
  context: string,
  namespace?: string,
  shouldCreateNamespace?: boolean
) {
  try {
    dispatch(setApplyingResource(true));

    try {
      const child = applyHelmChartToCluster(
        valuesFile,
        helmChart,
        fileMap,
        kubeconfig,
        context,
        namespace,
        shouldCreateNamespace
      );

      child.on('exit', (code, signal) => {
        log.info(`Helm exited with code ${code} and signal ${signal}`);
        dispatch(setApplyingResource(false));
      });

      child.stdout.on('data', data => {
        const alert: AlertType = {
          type: AlertEnum.Success,
          title: `Installing Helm Chart ${helmChart.name} in cluster ${context} completed`,
          message: data.toString(),
        };
        dispatch(setAlert(alert));
        dispatch(setApplyingResource(false));
      });

      child.stderr.on('data', data => {
        const alert: AlertType = {
          type: AlertEnum.Error,
          title: `Installing Helm Chart ${helmChart.name} in cluster ${context} failed`,
          message: data.toString(),
        };
        dispatch(setAlert(alert));
        dispatch(setApplyingResource(false));
      });
    } catch (e) {
      log.error(e.message);
      dispatch(setApplyingResource(true));
    }
  } catch (e) {
    log.error(`Failed to installing Helm Chart ${helmChart.name} in cluster ${context}`);
    log.error(e);

    dispatch(setApplyingResource(false));
  }
}
