import { K8sResource } from '../../models/k8sresource';
import { spawn } from 'child_process';
import { stringify } from 'yaml';
import path from 'path';
import { isKustomizationResource } from '../../redux/utils/resource';
import log from 'loglevel';
import { ResourceMapType } from '../../models/appstate';

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

export async function applyResource(resourceId: string, resourceMap: ResourceMapType) {
  try {
    const resource = resourceMap[resourceId];
    if (resource && resource.content) {
      const child = isKustomizationResource(resource) ? applyKustomization(resource) : applyK8sResource(resource);

      child.on('exit', function(code, signal) {
        log.info(`kubectl exited with code ${code} and signal ${signal}`);
      });

      child.stdout.on('data', (data) => {
        log.info(`child stdout:\n${data}`);
      });

      child.stderr.on('data', (data) => {
        log.error(`child stderr:\n${data}`);
      });
    }
  } catch (e) {
    log.error('Failed to apply resource');
    log.error(e);
  }
}
