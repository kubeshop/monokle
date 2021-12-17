import {spawn} from 'child_process';
import log from 'loglevel';
import {stringify} from 'yaml';

import {AlertEnum, AlertType} from '@models/alert';
import {FileMapType, ResourceMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';

import {setAlert} from '@redux/reducers/alert';
import {setApplyingResource, setClusterDiffRefreshDiffResource, updateResource} from '@redux/reducers/main';
import {getAbsoluteResourceFolder} from '@redux/services/fileEntry';
import {KustomizeCommandType, isKustomizationResource} from '@redux/services/kustomize';
import {AppDispatch} from '@redux/store';
import {applyYamlToCluster} from '@redux/thunks/applyYaml';
import {getResourceFromCluster} from '@redux/thunks/utils';

import {PROCESS_ENV} from '@utils/env';
import {getShellPath} from '@utils/shell';

import {performResourceDiff} from './diffResource';

/**
 * Invokes kubectl for the content of the specified resource
 */

function applyK8sResource(resource: K8sResource, kubeconfig: string, context: string, namespace: string) {
  return applyYamlToCluster(resource.text, kubeconfig, context, namespace);
}

/**
 * Invokes kubectl -k for the content of the specified kustomization
 */

function applyKustomization(
  resource: K8sResource,
  fileMap: FileMapType,
  kubeconfig: string,
  context: string,
  namespace: string,
  kustomizeCommand: KustomizeCommandType
) {
  const folder = getAbsoluteResourceFolder(resource, fileMap);
  const child =
    kustomizeCommand === 'kubectl'
      ? spawn(`kubectl --context ${context} --namespace ${namespace} apply -k ${folder}`, {
          shell: true,
          env: {
            NODE_ENV: PROCESS_ENV.NODE_ENV,
            PUBLIC_URL: PROCESS_ENV.PUBLIC_URL,
            PATH: getShellPath(),
            KUBECONFIG: kubeconfig,
          },
        })
      : spawn(`kustomize build ${folder} | kubectl --context ${context} --namespace ${namespace} apply -k -`, {
          shell: true,
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
 * applies the specified resource and creates corresponding alert
 *
 * this isn't actually a Thunk - but should be in the future!
 */

export async function applyResource(
  resourceId: string,
  resourceMap: ResourceMapType,
  fileMap: FileMapType,
  dispatch: AppDispatch,
  kubeconfig: string,
  context: string,
  namespace: string,
  options?: {
    isClusterPreview?: boolean;
    isInClusterDiff?: boolean;
    shouldPerformDiff?: boolean;
    kustomizeCommand?: 'kubectl' | 'kustomize';
  }
) {
  try {
    const resource = resourceMap[resourceId];
    if (resource && resource.text) {
      dispatch(setApplyingResource(true));

      try {
        const child = isKustomizationResource(resource)
          ? applyKustomization(
              resource,
              fileMap,
              kubeconfig,
              context,
              namespace,
              options && options.kustomizeCommand ? options.kustomizeCommand : 'kubectl'
            )
          : applyK8sResource(resource, kubeconfig, context, namespace);

        child.on('exit', (code, signal) => {
          log.info(`kubectl exited with code ${code} and signal ${signal}`);
          dispatch(setApplyingResource(false));
        });

        child.stdout.on('data', data => {
          const alert: AlertType = {
            type: AlertEnum.Success,
            title: `Applied ${resource.name} to cluster ${context} successfully`,
            message: data.toString(),
          };
          if (options?.isClusterPreview) {
            getResourceFromCluster(resource, kubeconfig, context).then(resourceFromCluster => {
              delete resourceFromCluster.body.metadata?.managedFields;
              const updatedResourceText = stringify(resourceFromCluster.body, {sortMapEntries: true});
              dispatch(
                updateResource({
                  resourceId: resource.id,
                  content: updatedResourceText,
                })
              );
              if (options?.shouldPerformDiff) {
                dispatch(performResourceDiff(resource.id));
              }
            });
          } else if (options?.shouldPerformDiff) {
            if (options?.isInClusterDiff) {
              dispatch(setClusterDiffRefreshDiffResource(true));
            } else {
              dispatch(performResourceDiff(resource.id));
            }
          }
          dispatch(setAlert(alert));
          dispatch(setApplyingResource(false));
        });

        child.stderr.on('data', data => {
          const alert: AlertType = {
            type: AlertEnum.Error,
            title: `Applying ${resource.name} to cluster ${context} failed`,
            message: data.toString(),
          };
          dispatch(setAlert(alert));
          dispatch(setApplyingResource(false));
        });
      } catch (e: any) {
        log.error(e.message);
        dispatch(setApplyingResource(true));
      }
    }
  } catch (e) {
    log.error('Failed to apply resource');
    log.error(e);

    dispatch(setApplyingResource(false));
  }
}
