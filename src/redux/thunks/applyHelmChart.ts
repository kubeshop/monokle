import log from 'loglevel';
import path from 'path';

import {AlertEnum, AlertType} from '@models/alert';
import {AppDispatch} from '@models/appdispatch';
import {FileMapType} from '@models/appstate';
import {HelmChart, HelmValuesFile} from '@models/helm';

import {setAlert} from '@redux/reducers/alert';
import {setApplyingResource} from '@redux/reducers/main';
import {getAbsoluteHelmChartPath, getAbsoluteValuesFilePath} from '@redux/services/fileEntry';

import {runHelmInMainThread} from '@utils/helm';

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
    'helm',
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

  return runHelmInMainThread({
    helmCommand: helmArgs.join(' '),
    kubeconfig,
  });
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
      const result = await applyHelmChartToCluster(
        valuesFile,
        helmChart,
        fileMap,
        kubeconfig,
        context,
        namespace,
        shouldCreateNamespace
      );

      if (result.exitCode && result.exitCode !== 0) {
        log.info(`Helm exited with code ${result.exitCode} and signal ${result.signal}`);
      }

      if (result.stdout) {
        const alert: AlertType = {
          type: AlertEnum.Success,
          title: `Installing Helm Chart ${helmChart.name} in cluster ${context} completed`,
          message: result.stdout,
        };
        dispatch(setAlert(alert));
        dispatch(setApplyingResource(false));
      } else if (result.stderr) {
        const alert: AlertType = {
          type: AlertEnum.Error,
          title: `Installing Helm Chart ${helmChart.name} in cluster ${context} failed`,
          message: result.stderr,
        };
        dispatch(setAlert(alert));
        dispatch(setApplyingResource(false));
      }
    } catch (e) {
      if (e instanceof Error) {
        log.error(e.message);
      }
      dispatch(setApplyingResource(true));
    }
  } catch (e) {
    log.error(`Failed to installing Helm Chart ${helmChart.name} in cluster ${context}`);
    log.error(e);

    dispatch(setApplyingResource(false));
  }
}
