import * as k8s from '@kubernetes/client-node';
import {KubeConfig} from '@kubernetes/client-node';

import {createAsyncThunk} from '@reduxjs/toolkit';

import {flatten} from 'lodash';
import log from 'loglevel';

import {YAML_DOCUMENT_DELIMITER_NEW_LINE} from '@constants/constants';

import {setClusterPreviewNamespace} from '@redux/reducers/appConfig';
import {currentClusterAccessSelector, kubeConfigPathSelector} from '@redux/selectors';
import {startWatchingResources} from '@redux/services/clusterResourceWatcher';
import {extractK8sResources} from '@redux/services/resource';
import {createRejectionWithAlert, getK8sObjectsAsYaml} from '@redux/thunks/utils';

import {getRegisteredKindHandlers, getResourceKindHandler} from '@src/kindhandlers';

import {AlertEnum, AlertType} from '@shared/models/alert';
import {AppDispatch} from '@shared/models/appDispatch';
import {ClusterAccess} from '@shared/models/config';
import {K8sResource, ResourceMap} from '@shared/models/k8sResource';
import {ClusterOrigin} from '@shared/models/origin';
import {RootState} from '@shared/models/rootState';
import {createKubeClient} from '@shared/utils/kubeclient';
import {trackEvent} from '@shared/utils/telemetry';

const getNonCustomClusterObjects = async (kc: any, namespace?: string, allNamespaces?: boolean) => {
  return Promise.allSettled(
    getRegisteredKindHandlers()
      .filter(
        handler =>
          !handler.isCustom &&
          (allNamespaces ? true : namespace === '<not-namespaced>' ? !handler.isNamespaced : handler.isNamespaced)
      )
      .map(resourceKindHandler =>
        resourceKindHandler
          .listResourcesInCluster(kc, {namespace})
          .then(items => getK8sObjectsAsYaml(items, resourceKindHandler.kind, resourceKindHandler.clusterApiVersion))
      )
  );
};

const loadClusterResourcesHandler = async (payload: {context: string; port?: number}, thunkAPI: any) => {
  const {context, port} = payload;
  const startTime = new Date().getTime();
  const clusterAccess = currentClusterAccessSelector(thunkAPI.getState());
  const kubeConfigPath = kubeConfigPathSelector(thunkAPI.getState());
  const clusterPreviewNamespace = thunkAPI.getState().config.clusterPreviewNamespace;

  let currentNamespace: string = clusterPreviewNamespace;

  try {
    let kc = createKubeClient(kubeConfigPath, context);

    if (port) {
      const proxyKubeConfig = new KubeConfig();
      proxyKubeConfig.loadFromOptions({
        currentContext: kc.getCurrentContext(),
        clusters: kc.getClusters().map(c => ({...c, server: `http://127.0.0.1:${port}`, skipTLSVerify: true})),
        users: kc.getUsers(),
        contexts: kc.getContexts(),
      });
      kc = proxyKubeConfig;
    }

    let foundNamespace: ClusterAccess | undefined;
    let results: PromiseSettledResult<string>[] | PromiseSettledResult<string>[][];

    if (clusterAccess && clusterAccess.length) {
      foundNamespace = clusterAccess?.find(ca => ca.namespace === currentNamespace);

      if (currentNamespace === '<all>') {
        results = await Promise.all(
          clusterAccess.map((ca: ClusterAccess) => getNonCustomClusterObjects(kc, ca.namespace, true))
        );
      } else {
        if (currentNamespace !== '<not-namespaced>' && !foundNamespace) {
          currentNamespace = clusterAccess[0].namespace;
          thunkAPI.dispatch(setClusterPreviewNamespace(currentNamespace));
        }

        results = await getNonCustomClusterObjects(kc, currentNamespace);
      }
    } else {
      results = await getNonCustomClusterObjects(kc);
    }

    const flatResults = flatten(results);

    const fulfilledResults = flatResults.filter((r: any) => r.status === 'fulfilled' && r.value);
    if (fulfilledResults.length === 0) {
      return createRejectionWithAlert(
        thunkAPI,
        'Cluster Resources Failed',
        // @ts-ignore
        results[0].reason ? results[0].reason.toString() : JSON.stringify(results[0])
      );
    }

    // @ts-ignore
    const allYaml = fulfilledResults.map(r => r.value).join(YAML_DOCUMENT_DELIMITER_NEW_LINE);

    const clusterResourceMap = Object.values(
      extractK8sResources(allYaml, {
        storage: 'cluster',
        context,
      })
    ).reduce((acc: ResourceMap<ClusterOrigin>, resource) => {
      acc[resource.id] = resource;
      return acc;
    }, {});

    // if the cluster contains CRDs we need to check if there are any corresponding resources also
    const customResourceDefinitions = Object.values(clusterResourceMap).filter(
      r => r.kind === 'CustomResourceDefinition'
    );
    if (customResourceDefinitions.length > 0) {
      let customResourceObjects: string[];

      if (clusterAccess && clusterAccess.length) {
        if (currentNamespace === '<all>') {
          customResourceObjects = flatten(
            await Promise.all(
              clusterAccess.map((ca: ClusterAccess) =>
                loadCustomResourceObjects(kc, customResourceDefinitions, ca.namespace)
              )
            )
          );
        } else {
          customResourceObjects = await loadCustomResourceObjects(kc, customResourceDefinitions, currentNamespace);
        }
      } else {
        customResourceObjects = await loadCustomResourceObjects(kc, customResourceDefinitions);
      }

      // if any were found we need to merge them into the preview-result
      if (customResourceObjects.length > 0) {
        const customResourcesYaml = customResourceObjects.join(YAML_DOCUMENT_DELIMITER_NEW_LINE);
        const customResources = extractK8sResources(customResourcesYaml, {storage: 'cluster', context});
        customResources.forEach(r => {
          clusterResourceMap[r.id] = r;
        });
      }
    }

    // TODO: process the resources via the validation listener after the preview is complete

    const endTime = new Date().getTime();

    trackEvent('preview/cluster', {
      resourcesCount: Object.keys(clusterResourceMap).length,
      executionTime: endTime - startTime,
    });

    startWatchingResources(thunkAPI.dispatch, kc, clusterResourceMap, clusterPreviewNamespace);

    const alert: AlertType = {
      type: AlertEnum.Success,
      title: 'Cluster Resources Loaded',
      message: `Loaded ${Object.keys(clusterResourceMap).length} resources from ${context}}`,
    };

    return {
      resources: Object.values(clusterResourceMap),
      alert,
      context,
    };
  } catch (e: any) {
    log.error(e);
    return createRejectionWithAlert(thunkAPI, 'Cluster Resources Failed', e.message);
  }
};

/**
 * Thunk to preview cluster objects
 */

export const loadClusterResources = createAsyncThunk<
  {
    resources: K8sResource<ClusterOrigin>[];
    context: string;
  },
  {context: string; port?: number},
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/loadClusterResources', loadClusterResourcesHandler);

export const reloadClusterResources = createAsyncThunk<
  {
    resources: K8sResource<ClusterOrigin>[];
    context: string;
  },
  {context: string; port?: number},
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/reloadClusterResources', loadClusterResourcesHandler);

/**
 * Find the default version in line with the algorithm described at
 * https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definition-versioning/#version-priority
 */

const crdVersionRegex = /(v)(\d*)(alpha|beta)?(\d*)?/;

export function findDefaultVersion(crd: any) {
  if (!crd?.spec?.versions) {
    return undefined;
  }

  const versionNames: string[] = crd.spec.versions.map((v: any) => v.name);

  versionNames.sort((a, b) => {
    const m1 = crdVersionRegex.exec(a);
    const m2 = crdVersionRegex.exec(b);

    // do both versions match the regex?
    if (m1 && m2) {
      // do both have initial version number?
      if (m1[2] && m2[2]) {
        // is the initial version the same?
        if (m1[2] === m2[2]) {
          // do both have an alpha or beta tag?
          if (m1[3] && m2[3]) {
            // is the tag the same?
            if (m1[3] === m2[3]) {
              // do both have an alpha or beta version?
              if (m1[4] && m2[4]) {
                return parseInt(m1[4], 10) - parseInt(m2[4], 10);
              }
              return m1[4] ? 1 : -1;
            }
            // compare tags (negate for beta > alpha)
            return -m1[3].localeCompare(m2[3]);
          }
          return m1[3] ? 1 : -1;
        }
        // compare version numbers
        return parseInt(m2[2], 10) - parseInt(m1[2], 10);
      }
      return m1[2] ? 1 : -1;
    }
    if (m1) return 1;
    if (m2) return -1;

    return a.localeCompare(b);
  });

  return versionNames.length > 0 ? versionNames[0] : undefined;
}

/**
 * Load custom resource objects for CRDs found in cluster
 */

async function loadCustomResourceObjects(
  kc: KubeConfig,
  customResourceDefinitions: K8sResource[],
  namespace?: string,
  allNamespaces?: string
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
          return kindHandler.listResourcesInCluster(kc, {namespace}, crd).then(response =>
            // @ts-ignore
            getK8sObjectsAsYaml(response.body.items)
          );
        }

        // retrieve objects using latest version name
        const version = findDefaultVersion(crd.object) || 'v1';
        return namespace
          ? k8sApi
              .listNamespacedCustomObject(crd.object.spec.group, version, namespace, crd.object.spec.names.plural)
              .then(response =>
                // @ts-ignore
                getK8sObjectsAsYaml(response.body.items)
              )
          : k8sApi
              .listClusterCustomObject(crd.object.spec.group, version, crd.object.spec.names.plural)
              .then(response =>
                // @ts-ignore
                getK8sObjectsAsYaml(response.body.items)
              );
      });

    const customResults = await Promise.allSettled(customObjects);
    // @ts-ignore
    return customResults.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value);
  } catch (e) {
    log.warn(e);
  }

  return [];
}
