import { K8sResource } from '../../models/k8sresource';
import { spawn } from 'child_process';
import { stringify } from 'yaml';
import path from 'path';
import { isKustomizationResource } from '../../redux/utils/resource';
import log from 'loglevel';
import { ResourceMapType } from '../../models/appstate';
import { setAlert } from '../../redux/reducers/alert';
import { AlertEnum, AlertType } from '../../models/alert';
import { AppDispatch } from '../../redux/store';

function applyK8sResource(resource: K8sResource) {
  const child = spawn('kubectl', ['apply', '-f', '-']);
  child.stdin.write(stringify(resource.content));
  child.stdin.end();
  return child;
}

function applyKustomization(resource: K8sResource) {
  const folder = resource.path.substr(0, resource.path.lastIndexOf(path.sep));
  const child = spawn('kubectl', ['apply', '-k', folder]);
  return child;
}

export async function applyResource(resourceId: string, resourceMap: ResourceMapType, dispatch: AppDispatch) {

  try {
    const resource = resourceMap[resourceId];
    if (resource && resource.content) {
      const child = isKustomizationResource(resource) ? applyKustomization(resource) : applyK8sResource(resource);

      child.on('exit', function(code, signal) {
        log.info(`kubectl exited with code ${code} and signal ${signal}`);
      });

      child.stdout.on('data', (data) => {
        const alert: AlertType = {
          type: AlertEnum.Message,
          title: 'Apply completed',
          message: data.toString(),
        };
        dispatch(setAlert(alert));
      });

      child.stderr.on('data', (data) => {
        const alert: AlertType = {
          type: AlertEnum.Error,
          title: 'Apply failed',
          message: data.toString(),
        };
        dispatch(setAlert(alert));
      });
    }
  } catch (e) {
    log.error('Failed to apply resource');
    log.error(e);
  }
}
