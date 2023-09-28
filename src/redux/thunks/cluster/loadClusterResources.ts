import * as k8s from '@kubernetes/client-node';
import {KubeConfig} from '@kubernetes/client-node';

import {createAsyncThunk} from '@reduxjs/toolkit';

import {flatten, isArray} from 'lodash';
import log from 'loglevel';

import {YAML_DOCUMENT_DELIMITER_NEW_LINE} from '@constants/constants';

import {kubeConfigContextSelector, kubeConfigPathSelector} from '@redux/appConfig';
import {startWatchingResources} from '@redux/services/clusterResourceWatcher';
import {extractK8sResources, getTargetClusterNamespaces} from '@redux/services/resource';
import {createRejectionWithAlert, getK8sObjectsAsYaml} from '@redux/thunks/utils';

import {getRegisteredKindHandlers, getResourceKindHandler} from '@src/kindhandlers';

import {AppDispatch} from '@shared/models/appDispatch';
import {K8sResource, ResourceMap} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';
import {translateNamespaceToTrackableName} from '@shared/models/telemetry';
import {createKubeClient} from '@shared/utils/kubeclient';
import {isPromiseFulfilledResult} from '@shared/utils/promises';
import {trackEvent} from '@shared/utils/telemetry';

import {findDefaultVersionForCRD} from './findDefaultVersionForCRD';

const getNonCustomClusterObjects = async (kc: any, namespace?: string, allNamespaces?: boolean) => {
  const registeredHandlers = getRegisteredKindHandlers();
  const filteredHandlers = registeredHandlers.filter(handler => {
    if (handler.isCustom) {
      return false;
    }
    if (allNamespaces) {
      return true;
    }
    if (namespace === '<not-namespaced>') {
      return !handler.isNamespaced;
    }
    return handler.isNamespaced;
  });
  return Promise.allSettled(
    filteredHandlers.map(resourceKindHandler =>
      resourceKindHandler
        .listResourcesInCluster(kc, {namespace})
        .then(items => getK8sObjectsAsYaml(items, resourceKindHandler.kind, resourceKindHandler.clusterApiVersion))
    )
  );
};

async function loadCustomResourceObjects(
  kc: KubeConfig,
  customResourceDefinitions: K8sResource[],
  namespace?: string,
  allNamespaces?: boolean
): Promise<string[]> {
  const k8sApi = kc.makeApiClient(k8s.CustomObjectsApi);

  try {
    const customObjects = customResourceDefinitions
      .filter(crd => crd.object.spec)
      .map(crd => {
        const kindHandler = getResourceKindHandler(crd.object.spec.names?.kind);
        if (
          kindHandler &&
          (allNamespaces
            ? true
            : namespace === '<not-namespaced>'
            ? !kindHandler.isNamespaced
            : kindHandler.isNamespaced)
        ) {
          return kindHandler.listResourcesInCluster(kc, {namespace}, crd).then(items => getK8sObjectsAsYaml(items));
        }

        // retrieve objects using latest version name
        const version = findDefaultVersionForCRD(crd.object) || 'v1';
        return namespace
          ? k8sApi
              .listNamespacedCustomObject(crd.object.spec.group, version, namespace, crd.object.spec.names.plural)
              .then(response => getK8sObjectsAsYaml(getItemsFromResponseBody(response.body)))
          : k8sApi
              .listClusterCustomObject(crd.object.spec.group, version, crd.object.spec.names.plural)
              .then(response => getK8sObjectsAsYaml(getItemsFromResponseBody(response.body)));
      });

    const customResults = await Promise.allSettled(customObjects);

    return customResults.filter(isPromiseFulfilledResult).map(r => r.value);
  } catch (e) {
    log.warn(e);
  }

  return [];
}

const loadClusterResourcesHandler = async (
  payload: {context: string; namespace?: string; port?: number},
  thunkAPI: any
) => {
  const {context, port, namespace} = payload;
  const startTime = new Date().getTime();
  const kubeConfigContext = kubeConfigContextSelector(thunkAPI.getState());
  const kubeConfigPath = kubeConfigPathSelector(thunkAPI.getState());
  const useKubectlProxy = thunkAPI.getState().config.useKubectlProxy;

  let currentNamespace: string = namespace ?? 'default';

  trackEvent('preview/cluster/start', {namespace: translateNamespaceToTrackableName(currentNamespace)});

  try {
    let namespaces: Array<string> = [];
    if (kubeConfigPath?.trim().length) {
      namespaces = await getTargetClusterNamespaces(kubeConfigPath, kubeConfigContext);
      if (namespaces.length === 0) {
        throw new Error('no_namespaces_found');
      }
      if (
        currentNamespace !== '<all>' &&
        currentNamespace !== '<not-namespaced>' &&
        !namespaces.includes(currentNamespace)
      ) {
        currentNamespace = 'default';
      }
    }

    let kc = createKubeClient(kubeConfigPath, context, port);
    let results: PromiseSettledResult<string>[] | PromiseSettledResult<string>[][] = [];

    if (currentNamespace === '<all>') {
      results = await getNonCustomClusterObjects(kc, undefined, true);
    } else {
      results = await getNonCustomClusterObjects(kc, currentNamespace);
    }

    const flatResults = flatten(results);

    const fulfilledResults = flatResults.filter((r: any) => r.status === 'fulfilled' && r.value);
    if (fulfilledResults.length === 0) {
      let message =
        'reason' in results[0] && results[0].reason ? results[0].reason.toString() : JSON.stringify(results[0]);
      trackEvent('preview/cluster/fail', {reason: message});
      return createRejectionWithAlert(thunkAPI, 'Cluster Resources Failed', message);
    }

    const allYaml = fulfilledResults
      .filter(isPromiseFulfilledResult)
      .map(r => r.value)
      .join(YAML_DOCUMENT_DELIMITER_NEW_LINE);

    const clusterResourceMap = Object.values(
      extractK8sResources(allYaml, 'cluster', {
        context,
      })
    ).reduce((acc: ResourceMap<'cluster'>, resource) => {
      acc[resource.id] = resource;
      return acc;
    }, {});

    // if the cluster contains CRDs we need to check if there are any corresponding resources also
    const customResourceDefinitions = Object.values(clusterResourceMap).filter(
      r => r.kind === 'CustomResourceDefinition'
    );
    if (customResourceDefinitions.length > 0) {
      let customResourceObjects: string[];

      if (currentNamespace === '<all>') {
        customResourceObjects = await loadCustomResourceObjects(kc, customResourceDefinitions, undefined, true);
      } else {
        customResourceObjects = await loadCustomResourceObjects(kc, customResourceDefinitions, currentNamespace);
      }

      // if any were found we need to merge them into the preview-result
      if (customResourceObjects.length > 0) {
        const customResourcesYaml = customResourceObjects.join(YAML_DOCUMENT_DELIMITER_NEW_LINE);
        const customResources = extractK8sResources(customResourcesYaml, 'cluster', {context});
        customResources.forEach(r => {
          clusterResourceMap[r.id] = r;
        });
      }
    }

    const endTime = new Date().getTime();

    trackEvent('preview/cluster/end', {
      resourcesCount: Object.keys(clusterResourceMap).length,
      executionTime: endTime - startTime,
    });

    startWatchingResources(thunkAPI.dispatch, kc, clusterResourceMap, currentNamespace);

    return {
      resources: Object.values(clusterResourceMap),
      context,
      kubeConfigPath,
      namespace: currentNamespace,
    };
  } catch (e: any) {
    log.error(e);
    trackEvent('preview/cluster/fail', {reason: e.message});

    if (useKubectlProxy) {
      return createRejectionWithAlert(thunkAPI, 'Cluster Resources Failed', e.message);
    }

    return thunkAPI.rejectWithValue({});
  }
};

/**
 * Thunk to preview cluster objects
 */

export const loadClusterResources = createAsyncThunk<
  {
    resources: K8sResource<'cluster'>[];
    context: string;
    kubeConfigPath: string;
    namespace: string;
  },
  {context: string; namespace?: string; port?: number},
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/loadClusterResources', loadClusterResourcesHandler);

export const reloadClusterResources = createAsyncThunk<
  {
    resources: K8sResource<'cluster'>[];
    context: string;
    kubeConfigPath: string;
    namespace: string;
  },
  {context: string; namespace?: string; port?: number},
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/reloadClusterResources', loadClusterResourcesHandler);

/**
 * Load custom resource objects for CRDs found in cluster
 */

const getItemsFromResponseBody = (body: any) => {
  const items = 'items' in body ? body.items : [];
  return isArray(items) ? items : [];
};
