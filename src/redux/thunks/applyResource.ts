import {createAsyncThunk} from '@reduxjs/toolkit';

import _, {cloneDeep} from 'lodash';
import log from 'loglevel';
import {stringify} from 'yaml';

import {currentConfigSelector, kubeConfigContextSelector} from '@redux/appConfig';
import {setAlert} from '@redux/reducers/alert';
import {addResource, openResourceDiffModal, setApplyingResource} from '@redux/reducers/main';
import {getAbsoluteResourceFolder} from '@redux/services/fileEntry';
import {isKustomizationResource} from '@redux/services/kustomize';
import {extractK8sResources} from '@redux/services/resource';
import {applyYamlToCluster} from '@redux/thunks/applyYaml';
import {runKustomize} from '@redux/thunks/preview';
import {updateResource} from '@redux/thunks/updateResource';
import {getResourceFromCluster, removeNamespaceFromCluster} from '@redux/thunks/utils';

import {errorAlert, successAlert} from '@utils/alert';
import {stringifyK8sResource} from '@utils/yaml';

import {AlertEnum, AlertType} from '@shared/models/alert';
import {AppDispatch} from '@shared/models/appDispatch';
import {FileMapType} from '@shared/models/appState';
import {ProjectConfig} from '@shared/models/config';
import {K8sObject} from '@shared/models/k8s';
import {
  ResourceContentMapByStorage,
  ResourceIdentifier,
  ResourceMeta,
  ResourceMetaMapByStorage,
  isLocalResourceMeta,
} from '@shared/models/k8sResource';
import {ThunkApi} from '@shared/models/thunk';
import {trackEvent} from '@shared/utils/telemetry';

/**
 * Invokes kubectl for the content of the specified resource
 */

function applyK8sResource(
  resource: K8sObject,
  context: string,
  kubeconfig?: string,
  namespace?: {name: string; new: boolean}
) {
  const resourceObject = _.cloneDeep(resource);
  if (namespace && namespace.name !== resourceObject.metadata?.namespace) {
    delete resourceObject.metadata.namespace;
  }

  return applyYamlToCluster({
    yaml: stringifyK8sResource(resourceObject),
    context,
    kubeconfig,
    namespace,
  });
}

/**
 * Invokes kubectl -k for the content of the specified kustomization
 */

function applyKustomization(
  resourceMeta: ResourceMeta<'local'>,
  fileMap: FileMapType,
  context: string,
  projectConfig: ProjectConfig,
  namespace?: {name: string; new: boolean}
) {
  const folder = getAbsoluteResourceFolder(resourceMeta, fileMap);

  const args: string[] = ['--context', JSON.stringify(context)];
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
  resourceIdentifeir: ResourceIdentifier,
  resourceMetaMapByStorage: ResourceMetaMapByStorage,
  resourceContentMapByStorage: ResourceContentMapByStorage,
  fileMap: FileMapType,
  dispatch: AppDispatch,
  projectConfig: ProjectConfig,
  context: string,
  namespace?: {name: string; new: boolean},
  options?: {
    isInClusterMode?: boolean;
    shouldPerformDiff?: boolean;
    quiet?: boolean;
    providedResourceObject?: K8sObject;
  }
) {
  const providedResourceObject = options?.providedResourceObject;
  const showAlert = options?.quiet !== true;
  const resourceMeta = resourceMetaMapByStorage[resourceIdentifeir.storage][resourceIdentifeir.id];

  const resourceContent = providedResourceObject
    ? {text: stringify(providedResourceObject), object: providedResourceObject}
    : cloneDeep(resourceContentMapByStorage[resourceIdentifeir.storage][resourceIdentifeir.id]);

  // Related to this https://stackoverflow.com/questions/51297136/kubectl-error-the-object-has-been-modified-please-apply-your-changes-to-the-la
  // We need to remove certain properties before updating the resource in cluster mode
  if (options?.isInClusterMode) {
    delete resourceContent.object.metadata.creationTimestamp;
    delete resourceContent.object.metadata.resourceVersion;
  }

  try {
    if (resourceMeta) {
      dispatch(setApplyingResource(true));

      try {
        const kubeconfigPath = projectConfig.kubeConfig?.path;
        const isKustomization = isKustomizationResource(resourceMeta);
        const result =
          isKustomization && isLocalResourceMeta(resourceMeta)
            ? await applyKustomization(resourceMeta, fileMap, context, projectConfig, namespace)
            : await applyK8sResource(resourceContent.object, context, kubeconfigPath, namespace);

        if (isKustomization) {
          trackEvent('cluster/deploy_kustomization');
        } else {
          trackEvent('cluster/deploy_resource', {kind: resourceMeta.kind});
        }

        if (result.exitCode !== null && result.exitCode !== 0) {
          log.warn(`apply exited with code ${result.exitCode} and signal ${result.signal}`);
        }

        dispatch(setApplyingResource(false));

        if (result.stdout) {
          if (options?.isInClusterMode && kubeconfigPath) {
            getResourceFromCluster(resourceMeta, kubeconfigPath, context).then(resourceFromCluster => {
              delete resourceFromCluster?.metadata?.managedFields;
              const updatedResourceText = stringifyK8sResource(resourceFromCluster, {sortMapEntries: true});
              if (resourceContentMapByStorage.cluster[resourceFromCluster?.metadata?.uid]) {
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

          const alert = successAlert(`Applied ${resourceMeta.name} to cluster ${context} successfully`, result.stdout);
          if (showAlert) setTimeout(() => dispatch(setAlert(alert)), 400);
        }

        if (result.stderr) {
          if (namespace && namespace.new && kubeconfigPath) {
            await removeNamespaceFromCluster(namespace.name, kubeconfigPath, context);
          }

          const alert = errorAlert(`Applying ${resourceMeta.name} to cluster ${context} failed`, result.stderr);

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

export const applyResourceToCluster = createAsyncThunk<
  void,
  {
    resourceIdentifier: ResourceIdentifier;
    namespace?: {name: string; new: boolean};
    options?: {
      isInClusterMode?: boolean;
      shouldPerformDiff?: boolean;
      quiet?: boolean;
      providedResourceObject?: K8sObject;
    };
  },
  ThunkApi
>('main/applyResource', async ({resourceIdentifier, namespace, options}, {getState, dispatch}) => {
  const state = getState();
  const projectConfig = currentConfigSelector(state);
  const kubeConfigContext = kubeConfigContextSelector(state);
  await applyResource(
    resourceIdentifier,
    state.main.resourceMetaMapByStorage,
    state.main.resourceContentMapByStorage,
    state.main.fileMap,
    dispatch,
    projectConfig,
    kubeConfigContext,
    namespace,
    options
  );
});
