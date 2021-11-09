import getClusterObjects from '@redux/services/getClusterObjects';
import {extractK8sResources} from '@redux/services/resource';
import {AppDispatch, RootState} from '@redux/store';
import {createAsyncThunk} from '@reduxjs/toolkit';

import {AlertEnum, AlertType} from '@models/alert';
import {ResourceMapType} from '@models/appstate';

import {CLUSTER_DIFF_PREFIX, YAML_DOCUMENT_DELIMITER_NEW_LINE} from '@constants/constants';

import {createRejectionWithAlert} from './utils';

export type LoadClusterDiffPayload = {
  resourceMap?: ResourceMapType;
  alert?: AlertType;
};

const CLUSTER_DIFF_FAILED = 'Cluster Comparison Failed';

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
  if (!state.config.kubeConfig.currentContext) {
    return createRejectionWithAlert(thunkAPI, CLUSTER_DIFF_FAILED, 'Could not find current kubeconfig context.');
  }
  try {
    return getClusterObjects(state.config.kubeconfigPath, state.config.kubeConfig.currentContext).then(
      results => {
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
        const resources = extractK8sResources(allYaml, CLUSTER_DIFF_PREFIX + state.config.kubeconfigPath);
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
      },
      reason => {
        return createRejectionWithAlert(thunkAPI, CLUSTER_DIFF_FAILED, reason.message);
      }
    );
  } catch (e: any) {
    return createRejectionWithAlert(thunkAPI, CLUSTER_DIFF_FAILED, e.message);
  }
});
