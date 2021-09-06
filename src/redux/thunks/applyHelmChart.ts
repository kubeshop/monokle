import log from 'loglevel';
import {AppDispatch} from '@redux/store';
import {setApplyingResource} from '@redux/reducers/main';
import {HelmChart, HelmValuesFile} from '@models/helm';
import {FileMapType} from '@models/appstate';
import {getShellPath} from '@utils/shell';
import {spawn} from 'child_process';
import {getAbsoluteHelmChartPath, getAbsoluteValuesFilePath} from '@redux/services/fileEntry';
import {setAlert} from '@redux/reducers/alert';
import {AlertEnum, AlertType} from '@models/alert';
import path from 'path';

/**
 * Invokes helm install for the specified helm chart and values file
 */

function applyHelmChartToCluster(
  valuesFile: HelmValuesFile,
  helmChart: HelmChart,
  fileMap: FileMapType,
  kubeconfig: string
) {
  const chartPath = path.dirname(getAbsoluteHelmChartPath(helmChart, fileMap));

  const child = spawn(
    'helm',
    ['install', '-f', getAbsoluteValuesFilePath(valuesFile, fileMap), helmChart.name, chartPath],
    {
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PUBLIC_URL: process.env.PUBLIC_URL,
        PATH: getShellPath(),
        KUBECONFIG: kubeconfig,
      },
    }
  );

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
  kubeconfig: string
) {
  try {
    dispatch(setApplyingResource(true));

    try {
      const child = applyHelmChartToCluster(valuesFile, helmChart, fileMap, kubeconfig);

      child.on('exit', (code, signal) => {
        log.info(`Helm exited with code ${code} and signal ${signal}`);
        dispatch(setApplyingResource(false));
      });

      child.stdout.on('data', data => {
        const alert: AlertType = {
          type: AlertEnum.Success,
          title: 'Installing Helm Chart completed',
          message: data.toString(),
        };
        dispatch(setAlert(alert));
        dispatch(setApplyingResource(false));
      });

      child.stderr.on('data', data => {
        const alert: AlertType = {
          type: AlertEnum.Error,
          title: 'Installing Helm Chart failed',
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
    log.error('Failed to install Helm Chart');
    log.error(e);

    dispatch(setApplyingResource(false));
  }
}
