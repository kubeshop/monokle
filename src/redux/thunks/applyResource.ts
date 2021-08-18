import {K8sResource} from '@models/k8sresource';
import {spawn} from 'child_process';
import log from 'loglevel';
import {ResourceMapType} from '@models/appstate';
import {RootEntry} from '@models/filesystementry';
import {setAlert} from '@redux/reducers/alert';
import {AlertEnum, AlertType} from '@models/alert';
import {AppDispatch} from '@redux/store';
import {getAbsoluteResourceFolder} from '@redux/services/fileSystemEntry';
import {isKustomizationResource} from '@redux/services/kustomize';
import {getShellPath} from '@utils/shell';
import {setApplyingResource} from '@redux/reducers/main';

/**
 * Invokes kubectl for the content of the specified resource
 */

function applyK8sResource(resource: K8sResource, kubeconfig: string) {
  const child = spawn('kubectl', ['apply', '-f', '-'], {
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PUBLIC_URL: process.env.PUBLIC_URL,
      PATH: getShellPath(),
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

function applyKustomization(resource: K8sResource, rootEntry: RootEntry, kubeconfig: string) {
  const folder = getAbsoluteResourceFolder(resource, rootEntry);
  const child = spawn('kubectl', ['apply', '-k', folder], {
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PUBLIC_URL: process.env.PUBLIC_URL,
      PATH: getShellPath(),
      KUBECONFIG: kubeconfig,
    },
  });
  return child;
}

/**
 * applies the specified resource and creates corresponding alert
 *
 * this isn't actually a Thunk - but should be in the future!
 */

export async function applyResource(
  resourceId: string,
  resourceMap: ResourceMapType,
  rootEntry: RootEntry,
  dispatch: AppDispatch,
  kubeconfig: string
) {
  try {
    const resource = resourceMap[resourceId];
    if (resource && resource.text) {
      dispatch(setApplyingResource(true));

      try {
        const child = isKustomizationResource(resource)
          ? applyKustomization(resource, rootEntry, kubeconfig)
          : applyK8sResource(resource, kubeconfig);

        child.on('exit', (code, signal) => {
          log.info(`kubectl exited with code ${code} and signal ${signal}`);
          dispatch(setApplyingResource(false));
        });

        child.stdout.on('data', data => {
          const alert: AlertType = {
            type: AlertEnum.Success,
            title: 'Apply completed',
            message: data.toString(),
          };
          dispatch(setAlert(alert));
          dispatch(setApplyingResource(false));
        });

        child.stderr.on('data', data => {
          const alert: AlertType = {
            type: AlertEnum.Error,
            title: 'Apply failed',
            message: data.toString(),
          };
          dispatch(setAlert(alert));
          dispatch(setApplyingResource(false));
        });
      } catch (e) {
        log.error(e.message);
        dispatch(setApplyingResource(true));
      }
    }
  } catch (e) {
    log.error('Failed to apply resource');
    log.error(e);
  }
}
