import {createAsyncThunk} from '@reduxjs/toolkit';

import {CLUSTER_DIFF_PREFIX, YAML_DOCUMENT_DELIMITER_NEW_LINE} from '@constants/constants';

import {AlertEnum, AlertType} from '@models/alert';
import {AppDispatch} from '@models/appdispatch';
import {ResourceMapType} from '@models/appstate';
import {RootState} from '@models/rootstate';

import getClusterObjects from '@redux/services/getClusterObjects';
import {extractK8sResources} from '@redux/services/resource';

import {createKubeClient} from '@utils/kubeclient';

import {createRejectionWithAlert} from './utils';

export type LoadClusterDiffPayload = {
  resourceMap?: ResourceMapType;
  alert?: AlertType;
};

const CLUSTER_DIFF_FAILED = 'Cluster Compare Failed';

function parseClusterResources(results: any[], thunkAPI: any, kc: any) {
  const fulfilledResults = results.filter(r => r.status === 'fulfilled' && r.value);

  if (fulfilledResults.length === 0) {
    return createRejectionWithAlert(
      thunkAPI,
      CLUSTER_DIFF_FAILED,
      // @ts-ignore
      results[0].reason ? results[0].reason.toString() : JSON.stringify(results[0])
    );
  }

  // @ts-ignore
  const allYaml = fulfilledResults.map(r => r.value).join(YAML_DOCUMENT_DELIMITER_NEW_LINE);
  const resources = extractK8sResources(allYaml, CLUSTER_DIFF_PREFIX + String(kc.currentContext));
  const resourceMap = resources.reduce((rm: ResourceMapType, r) => {
    rm[r.id] = r;
    return rm;
  }, {});

  if (fulfilledResults.length < results.length) {
    const rejectedResult = results.find(r => r.status === 'rejected');
    if (rejectedResult) {
      // @ts-ignore
      const reason = rejectedResult.reason ? rejectedResult.reason.toString() : JSON.stringify(rejectedResult);

      const alert = {
        title: 'Cluster Diff',
        message: `Failed to get all cluster resources: ${reason}`,
        type: AlertEnum.Warning,
      };

      return {resourceMap, alert};
    }
  }

  return {resourceMap};
}

export const loadClusterDiff = createAsyncThunk<
  LoadClusterDiffPayload,
  undefined,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/loadClusterDiff', async (_, thunkAPI) => {
  const state = thunkAPI.getState();
  if (!state.ui.isClusterDiffVisible) {
    return;
  }
  try {
    const namespaces = state.config.projectConfig?.settings?.clusterNamespaces;
    if (!namespaces || !namespaces.length) {
      return createRejectionWithAlert(thunkAPI, CLUSTER_DIFF_FAILED, 'Please configure a namespace');
    }

    const kc = createKubeClient(state.config);
    const promises = namespaces?.map((namespace) => getClusterObjects(kc, namespace));
    // TODO fix-types
    return Promise.allSettled<any>(promises)
      .then((results: any) => {
        const fulfilledResults: any = results.filter((r: any) => r.status === 'fulfilled' && r.value);
        const resources: any = [];
        fulfilledResults.forEach((fulfilledResult: any) => {
          resources.push(...fulfilledResult.value);
        });
        return parseClusterResources(results, thunkAPI, kc);
      }).catch(reason => {
        return createRejectionWithAlert(thunkAPI, CLUSTER_DIFF_FAILED, reason[0].message);
      });
  } catch (e: any) {
    return createRejectionWithAlert(thunkAPI, CLUSTER_DIFF_FAILED, e.message);
  }
});
