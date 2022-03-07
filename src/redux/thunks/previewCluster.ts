import * as k8s from '@kubernetes/client-node';
import {KubeConfig} from '@kubernetes/client-node';

import {createAsyncThunk} from '@reduxjs/toolkit';

import log from 'loglevel';

import {PREVIEW_PREFIX, YAML_DOCUMENT_DELIMITER_NEW_LINE} from '@constants/constants';

import {AlertEnum} from '@models/alert';
import {AppDispatch} from '@models/appdispatch';
import {K8sResource} from '@models/k8sresource';
import {RootState} from '@models/rootstate';

import {SetPreviewDataPayload} from '@redux/reducers/main';
import {extractK8sResources, processResources} from '@redux/services/resource';
import {createPreviewResult, createRejectionWithAlert, getK8sObjectsAsYaml} from '@redux/thunks/utils';

import {createKubeClient} from '@utils/kubeclient';
import {CLUSTER_VIEW, trackEvent} from '@utils/telemetry';

import {getRegisteredKindHandlers, getResourceKindHandler} from '@src/kindhandlers';

const previewClusterHandler = async (context: string, thunkAPI: any) => {
  const resourceRefsProcessingOptions = thunkAPI.getState().main.resourceRefsProcessingOptions;
  const k8sVersion = thunkAPI.getState().config.projectConfig?.k8sVersion;
  const userDataDir = thunkAPI.getState().config.userDataDir;
  try {
    const kc = createKubeClient(thunkAPI.getState().config, context);

    const results = await Promise.allSettled(
      getRegisteredKindHandlers()
        .filter(handler => !handler.isCustom)
        .map(resourceKindHandler =>
          resourceKindHandler
            .listResourcesInCluster(kc)
            .then(items => getK8sObjectsAsYaml(items, resourceKindHandler.kind, resourceKindHandler.clusterApiVersion))
        )
    );

    const fulfilledResults = results.filter(r => r.status === 'fulfilled' && r.value);
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

    const previewResult = createPreviewResult(
      k8sVersion,
      userDataDir,
      allYaml,
      context,
      'Get Cluster Resources',
      resourceRefsProcessingOptions,
      context,
      kc.currentContext
    );

    // if the cluster contains CRDs we need to check if there any corresponding resources also
    const customResourceDefinitions = Object.values(previewResult.previewResources).filter(
      r => r.kind === 'CustomResourceDefinition'
    );
    if (customResourceDefinitions.length > 0) {
      const customResourceObjects = await loadCustomResourceObjects(kc, customResourceDefinitions);

      // if any were found we need to merge them into the preview-result
      if (customResourceObjects.length > 0) {
        const customResourcesYaml = customResourceObjects.join(YAML_DOCUMENT_DELIMITER_NEW_LINE);
        const customResources = extractK8sResources(customResourcesYaml, PREVIEW_PREFIX + context);
        customResources.forEach(r => {
          previewResult.previewResources[r.id] = r;
        });

        // only process newly added custom resources
        processResources(k8sVersion, userDataDir, previewResult.previewResources, resourceRefsProcessingOptions, {
          resourceIds: customResources.map(r => r.id),
        });

        trackEvent(CLUSTER_VIEW, {numberOfResourcesInCluster: Object.keys(previewResult.previewResources).length});

        previewResult.alert.message = `Previewing ${Object.keys(previewResult.previewResources).length} resources`;
      }
    }

    if (fulfilledResults.length < results.length) {
      const rejectedResult = results.find(r => r.status === 'rejected');
      if (rejectedResult) {
        // @ts-ignore
        const reason = rejectedResult.reason ? rejectedResult.reason.toString() : JSON.stringify(rejectedResult);

        previewResult.alert = {
          title: 'Get Cluster Resources',
          message: `Failed to get all cluster resources: ${reason}`,
          type: AlertEnum.Warning,
        };

        return previewResult;
      }
    }
    return previewResult;
  } catch (e: any) {
    return createRejectionWithAlert(thunkAPI, 'Cluster Resources Failed', e.message);
  }
};

/**
 * Thunk to preview cluster objects
 */

export const previewCluster = createAsyncThunk<
  SetPreviewDataPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/previewCluster', previewClusterHandler);

export const repreviewCluster = createAsyncThunk<
  SetPreviewDataPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/repreviewCluster', previewClusterHandler);

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
        return parseInt(m1[2], 10) - parseInt(m2[2], 10);
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

async function loadCustomResourceObjects(kc: KubeConfig, customResourceDefinitions: K8sResource[]): Promise<string[]> {
  const k8sApi = kc.makeApiClient(k8s.CustomObjectsApi);

  try {
    const customObjects = customResourceDefinitions
      .filter(crd => crd.content.spec)
      .map(crd => {
        const kindHandler = getResourceKindHandler(crd.content.spec.names?.kind);
        if (kindHandler) {
          return kindHandler.listResourcesInCluster(kc, crd).then(response =>
            // @ts-ignore
            getK8sObjectsAsYaml(response.body.items)
          );
        }

        // retrieve objects using latest version name
        // @ts-ignore
        return k8sApi
          .listClusterCustomObject(
            crd.content.spec.group,
            findDefaultVersion(crd.content) || 'v1',
            crd.content.spec.names.plural
          )
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
