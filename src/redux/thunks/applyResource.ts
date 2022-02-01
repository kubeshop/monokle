import {spawn} from 'child_process';
import _ from 'lodash';
import log from 'loglevel';
import {stringify} from 'yaml';

import {PREVIEW_PREFIX} from '@constants/constants';

import {AlertEnum, AlertType} from '@models/alert';
import {AppDispatch} from '@models/appdispatch';
import {FileMapType, ResourceMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {KustomizeCommandType} from '@models/kustomize';

import {setAlert} from '@redux/reducers/alert';
import {
  addResource,
  openResourceDiffModal,
  setApplyingResource,
  setClusterDiffRefreshDiffResource,
  updateResource,
} from '@redux/reducers/main';
import {getAbsoluteResourceFolder} from '@redux/services/fileEntry';
import {isKustomizationResource} from '@redux/services/kustomize';
import {extractK8sResources} from '@redux/services/resource';
import {applyYamlToCluster} from '@redux/thunks/applyYaml';
import {getResourceFromCluster} from '@redux/thunks/utils';

import {PROCESS_ENV} from '@utils/env';
import {getShellPath} from '@utils/shell';

/**
 * Invokes kubectl for the content of the specified resource
 */

function applyK8sResource(resource: K8sResource, kubeconfig: string, context: string, namespace?: string) {
  const resourceContent = _.cloneDeep(resource.content);
  if (resource.namespace && namespace && namespace !== resource.namespace) {
    delete resourceContent.metadata.namespace;
  }

  return applyYamlToCluster(stringify(resourceContent), kubeconfig, context, namespace);
}

/**
 * Invokes kubectl -k for the content of the specified kustomization
 */

function applyKustomization(
  resource: K8sResource,
  fileMap: FileMapType,
  kubeconfig: string,
  context: string,
  kustomizeCommand: KustomizeCommandType,
  namespace?: string
) {
  const folder = getAbsoluteResourceFolder(resource, fileMap);

  const args =
    kustomizeCommand === 'kubectl'
      ? namespace
        ? `kubectl --context ${context} --namespace ${namespace} apply -k ${folder}`
        : `kubectl --context ${context} apply -k ${folder}`
      : namespace
      ? `kustomize build ${folder} | kubectl --context ${context} --namespace ${namespace} apply -k -`
      : `kustomize build ${folder} | kubectl --context ${context} apply -k -`;

  const child =
    kustomizeCommand === 'kubectl'
      ? spawn(args, {
          shell: true,
          env: {
            NODE_ENV: PROCESS_ENV.NODE_ENV,
            PUBLIC_URL: PROCESS_ENV.PUBLIC_URL,
            PATH: getShellPath(),
            KUBECONFIG: kubeconfig,
          },
        })
      : spawn(args, {
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
  namespace?: string,
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
              options && options.kustomizeCommand ? options.kustomizeCommand : 'kubectl',
              namespace
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
              if (resourceMap[resourceFromCluster.body.metadata?.uid]) {
                dispatch(
                  updateResource({
                    resourceId: resourceFromCluster.body.metadata?.uid,
                    content: updatedResourceText,
                  })
                );
              } else {
                const newK8sResource = extractK8sResources(updatedResourceText, PREVIEW_PREFIX + kubeconfig)[0];
                dispatch(addResource(newK8sResource));
              }

              if (options?.shouldPerformDiff) {
                dispatch(openResourceDiffModal(resourceFromCluster.body.metadata?.uid));
              }
            });
          } else if (options?.shouldPerformDiff) {
            if (options?.isInClusterDiff) {
              dispatch(setClusterDiffRefreshDiffResource(true));
            } else {
              dispatch(openResourceDiffModal(resource.id));
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
