import _ from 'lodash';
import log from 'loglevel';
import {stringify} from 'yaml';

import {setAlert} from '@redux/reducers/alert';
import {addResource, openResourceDiffModal, setApplyingResource} from '@redux/reducers/main';
import {k8sApi} from '@redux/services/K8sApi';
import {getAbsoluteResourceFolder} from '@redux/services/fileEntry';
import {isKustomizationResource} from '@redux/services/kustomize';
import {extractK8sResources} from '@redux/services/resource';
import {applyYamlToCluster} from '@redux/thunks/applyYaml';
import {runKustomize} from '@redux/thunks/previewKustomization';
import {updateResource} from '@redux/thunks/updateResource';
import {getResourceFromCluster} from '@redux/thunks/utils';

import {errorAlert, successAlert} from '@utils/alert';

import {AlertEnum, AlertType} from '@shared/models/alert';
import {AppDispatch} from '@shared/models/appDispatch';
import {FileMapType} from '@shared/models/appState';
import {ProjectConfig} from '@shared/models/config';
import {K8sResource, ResourceMap, isLocalResource} from '@shared/models/k8sResource';
import {trackEvent} from '@shared/utils/telemetry';

/**
 * Invokes kubectl for the content of the specified resource
 */

function applyK8sResource(
  resource: K8sResource,
  context: string,
  kubeconfig?: string,
  namespace?: {name: string; new: boolean}
) {
  const resourceObject = _.cloneDeep(resource.object);
  if (namespace && namespace.name !== resourceObject.metadata?.namespace) {
    delete resourceObject.metadata.namespace;
  }

  return applyYamlToCluster({
    yaml: stringify(resourceObject),
    context,
    kubeconfig,
    namespace,
  });
}

/**
 * Invokes kubectl -k for the content of the specified kustomization
 */

function applyKustomization(
  resource: K8sResource<'local'>,
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
  resourceMap: ResourceMap,
  fileMap: FileMapType,
  dispatch: AppDispatch,
  projectConfig: ProjectConfig,
  context: string,
  namespace?: {name: string; new: boolean},
  options?: {
    isInClusterMode?: boolean;
    shouldPerformDiff?: boolean;
    quiet?: boolean;
  }
) {
  const showAlert = options?.quiet !== true;
  try {
    const resource = resourceMap[resourceId];
    if (resource && resource.text) {
      dispatch(setApplyingResource(true));

      try {
        const kubeconfigPath = projectConfig.kubeConfig?.path;
        const isKustomization = isKustomizationResource(resource);
        const result =
          isKustomization && isLocalResource(resource)
            ? await applyKustomization(resource, fileMap, context, projectConfig, namespace)
            : await applyK8sResource(resource, context, kubeconfigPath, namespace);

        if (isKustomization) {
          trackEvent('cluster/deploy_kustomization');
        } else {
          trackEvent('cluster/deploy_resource', {kind: resource.kind});
        }

        if (result.exitCode !== null && result.exitCode !== 0) {
          log.warn(`apply exited with code ${result.exitCode} and signal ${result.signal}`);
        }

        dispatch(setApplyingResource(false));

        if (result.stdout) {
          if (options?.isInClusterMode && kubeconfigPath) {
            getResourceFromCluster(resource, kubeconfigPath, context).then(resourceFromCluster => {
              delete resourceFromCluster?.metadata?.managedFields;
              const updatedResourceText = stringify(resourceFromCluster, {sortMapEntries: true});
              if (resourceMap[resourceFromCluster?.metadata?.uid]) {
                dispatch(
                  updateResource({
                    resourceIdentifier: {id: resourceFromCluster?.metadata?.uid, storage: 'cluster'},
                    text: updatedResourceText,
                  })
                );
              } else {
                const newK8sResource = extractK8sResources(updatedResourceText, 'cluster', {context})[0];
                dispatch(addResource(newK8sResource));
              }

              if (options?.shouldPerformDiff) {
                dispatch(openResourceDiffModal(resourceFromCluster?.metadata?.uid));
              }
            });
          }

          if (namespace && namespace.new) {
            const namespaceAlert: AlertType = {
              type: AlertEnum.Success,
              title: `Created ${namespace.name} namespace to cluster ${context} successfully`,
              message: '',
            };

            if (showAlert) dispatch(setAlert(namespaceAlert));
          }

          const alert = successAlert(`Applied ${resource.name} to cluster ${context} successfully`, result.stdout);
          if (showAlert) setTimeout(() => dispatch(setAlert(alert)), 400);
        }

        if (result.stderr) {
          if (namespace && namespace.new && kubeconfigPath) {
            //  await removeNamespaceFromCluster(namespace.name, kubeconfigPath, context);
            await dispatch(k8sApi.endpoints.deleteNamespace.initiate({namespace: namespace.name})).unwrap();
          }

          const alert = errorAlert(`Applying ${resource.name} to cluster ${context} failed`, result.stderr);
          if (showAlert) dispatch(setAlert(alert));
          dispatch(setApplyingResource(false));
        }
      } catch (e: any) {
        log.error(e);
        if (showAlert) dispatch(setAlert(errorAlert('Deploy failed', e.message)));
        dispatch(setApplyingResource(false));
      }
    }
  } catch (e: any) {
    log.error(e);
    if (showAlert) dispatch(setAlert(errorAlert('Deploy failed', e.message)));
    dispatch(setApplyingResource(false));
  }
}
