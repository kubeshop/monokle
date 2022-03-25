import _ from 'lodash';
import log from 'loglevel';
import {stringify} from 'yaml';

import {PREVIEW_PREFIX} from '@constants/constants';

import {AlertEnum, AlertType} from '@models/alert';
import {ProjectConfig} from '@models/appconfig';
import {AppDispatch} from '@models/appdispatch';
import {FileMapType, ResourceMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';

import {setAlert} from '@redux/reducers/alert';
import {
  addResource,
  openResourceDiffModal,
  setApplyingResource,
  setClusterDiffRefreshDiffResource,
} from '@redux/reducers/main';
import {getAbsoluteResourceFolder} from '@redux/services/fileEntry';
import {isKustomizationResource} from '@redux/services/kustomize';
import {extractK8sResources} from '@redux/services/resource';
import {applyYamlToCluster} from '@redux/thunks/applyYaml';
import {runKustomize} from '@redux/thunks/previewKustomization';
import {updateResource} from '@redux/thunks/updateResource';
import {getResourceFromCluster, removeNamespaceFromCluster} from '@redux/thunks/utils';

import {errorAlert, successAlert} from '@utils/alert';
import {APPLY, trackEvent} from '@utils/telemetry';

/**
 * Invokes kubectl for the content of the specified resource
 */

function applyK8sResource(
  resource: K8sResource,
  context: string,
  kubeconfig?: string,
  namespace?: {name: string; new: boolean}
) {
  const resourceContent = _.cloneDeep(resource.content);
  if (namespace && namespace.name !== resourceContent.metadata?.namespace) {
    delete resourceContent.metadata.namespace;
  }

  return applyYamlToCluster({
    yaml: stringify(resourceContent),
    context,
    kubeconfig,
    namespace,
  });
}

/**
 * Invokes kubectl -k for the content of the specified kustomization
 */

function applyKustomization(
  resource: K8sResource,
  fileMap: FileMapType,
  context: string,
  projectConfig: ProjectConfig,
  namespace?: {name: string; new: boolean}
) {
  const folder = getAbsoluteResourceFolder(resource, fileMap);

  const args: string[] = ['--context', context];
  if (namespace) {
    args.push(...['--namespace', namespace.name]);
  }

  return runKustomize(folder, projectConfig, args);
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
  projectConfig: ProjectConfig,
  context: string,
  namespace?: {name: string; new: boolean},
  options?: {
    isClusterPreview?: boolean;
    isInClusterDiff?: boolean;
    shouldPerformDiff?: boolean;
  }
) {
  try {
    const resource = resourceMap[resourceId];
    if (resource && resource.text) {
      dispatch(setApplyingResource(true));

      try {
        const kubeconfigPath = projectConfig.kubeConfig?.path;
        const isKustomization = isKustomizationResource(resource);
        const result = isKustomization
          ? await applyKustomization(resource, fileMap, context, projectConfig, namespace)
          : await applyK8sResource(resource, context, kubeconfigPath, namespace);

        trackEvent(APPLY, {kind: resource.kind, isKustomization, ...options});

        if (result.exitCode !== null && result.exitCode !== 0) {
          log.warn(`apply exited with code ${result.exitCode} and signal ${result.signal}`);
        }

        dispatch(setApplyingResource(false));

        if (result.stdout) {
          if (options?.isClusterPreview && kubeconfigPath) {
            getResourceFromCluster(resource, kubeconfigPath, context).then(resourceFromCluster => {
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
                const newK8sResource = extractK8sResources(updatedResourceText, PREVIEW_PREFIX + kubeconfigPath)[0];
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

          if (namespace && namespace.new) {
            const namespaceAlert: AlertType = {
              type: AlertEnum.Success,
              title: `Created ${namespace.name} namespace to cluster ${context} successfully`,
              message: '',
            };

            dispatch(setAlert(namespaceAlert));
          }

          const alert = successAlert(`Applied ${resource.name} to cluster ${context} successfully`, result.stdout);
          setTimeout(() => dispatch(setAlert(alert)), 400);
        }

        if (result.stderr) {
          if (namespace && namespace.new && kubeconfigPath) {
            await removeNamespaceFromCluster(namespace.name, kubeconfigPath, context);
          }

          const alert = errorAlert(`Applying ${resource.name} to cluster ${context} failed`, result.stderr);

          dispatch(setAlert(alert));
          dispatch(setApplyingResource(false));
        }
      } catch (e: any) {
        log.error(e);
        dispatch(setAlert(errorAlert('Deploy failed', e.message)));
        dispatch(setApplyingResource(false));
      }
    }
  } catch (e: any) {
    log.error(e);
    dispatch(setAlert(errorAlert('Deploy failed', e.message)));
    dispatch(setApplyingResource(false));
  }
}
