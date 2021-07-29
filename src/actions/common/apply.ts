import {K8sResource} from '@models/k8sresource';
import {spawn} from 'child_process';
import log from 'loglevel';
// @ts-ignore
import shellPath from 'shell-path';
import {FileMapType, ResourceMapType} from '@models/appstate';
import {setAlert} from '@redux/reducers/alert';
import {setLogs} from '@redux/reducers/logs';
import {AlertEnum, AlertType} from '@models/alert';
import {AppDispatch} from '@redux/store';
import {getAbsoluteResourceFolder} from '@redux/utils/fileEntry';
import {isKustomizationResource} from '@redux/utils/kustomize';

/**
 * Invokes kubectl for the content of the specified resource
 */

function applyK8sResource(resource: K8sResource, kubeconfig: string) {
  const child = spawn('kubectl', ['apply', '-f', '-'], {
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PUBLIC_URL: process.env.PUBLIC_URL,
      PATH: shellPath.sync(),
      KUBECONFIG: kubeconfig,
    },
  });
  child.stdin.write(resource.text);
  child.stdin.end();
  return child;
}

/**
 * Invokes kubectl -k for the content of the specified kustomization
 */

function applyKustomization(resource: K8sResource, fileMap: FileMapType, kubeconfig: string) {
  const folder = getAbsoluteResourceFolder(resource, fileMap);
  const child = spawn('kubectl', ['apply', '-k', folder], {
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PUBLIC_URL: process.env.PUBLIC_URL,
      PATH: shellPath.sync(),
      KUBECONFIG: kubeconfig,
    },
  });
  return child;
}

/**
 * applies the specified resource and creates corresponding alert
 */

export async function applyResource(
  resourceId: string,
  resourceMap: ResourceMapType,
  fileMap: FileMapType,
  dispatch: AppDispatch,
  kubeconfig: string
) {
  try {
    const resource = resourceMap[resourceId];
    if (resource && resource.text) {
      const child = isKustomizationResource(resource)
        ? applyKustomization(resource, fileMap, kubeconfig)
        : applyK8sResource(resource, kubeconfig);

      child.on('exit', (code, signal) => log.info(`kubectl exited with code ${code} and signal ${signal}`));

      child.stdout.on('data', data => {
        const alert: AlertType = {
          type: AlertEnum.Success,
          title: 'Apply completed',
          message: data.toString(),
        };
        dispatch(setAlert(alert));
        dispatch(setLogs([alert.message]));
      });

      child.stderr.on('data', data => {
        const alert: AlertType = {
          type: AlertEnum.Error,
          title: 'Apply failed',
          message: data.toString(),
        };
        dispatch(setAlert(alert));
        dispatch(setLogs([alert.message]));
      });
    }
  } catch (e) {
    log.error('Failed to apply resource');
    log.error(e);
  }
}
