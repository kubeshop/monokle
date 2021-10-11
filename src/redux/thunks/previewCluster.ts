import {createAsyncThunk} from '@reduxjs/toolkit';
import {SetPreviewDataPayload} from '@redux/reducers/main';
import {AppDispatch, RootState} from '@redux/store';
import * as k8s from '@kubernetes/client-node';
import {YAML_DOCUMENT_DELIMITER_NEW_LINE} from '@constants/constants';
import {AlertEnum} from '@models/alert';
import {createPreviewRejection, createPreviewResult, getK8sObjectsAsYaml} from '@redux/thunks/utils';

import {ResourceKindHandlers} from '@src/kindhandlers';

const previewClusterHandler = async (configPath: string, thunkAPI: any) => {
  try {
    const kc = new k8s.KubeConfig();
    kc.loadFromFile(configPath);
    kc.setCurrentContext(thunkAPI.getState().config.kubeConfig.currentContext);

    return Promise.allSettled(
      ResourceKindHandlers.map(resourceKindHandler =>
        resourceKindHandler
          .listResourcesInCluster(kc)
          .then(items => getK8sObjectsAsYaml(items, resourceKindHandler.kind, resourceKindHandler.clusterApiVersion))
      )
    ).then(
      results => {
        const fulfilledResults = results.filter(r => r.status === 'fulfilled' && r.value);

        if (fulfilledResults.length === 0) {
          return createPreviewRejection(
            thunkAPI,
            'Cluster Resources Failed',
            // @ts-ignore
            results[0].reason ? results[0].reason.toString() : JSON.stringify(results[0])
          );
        }

        // @ts-ignore
        const allYaml = fulfilledResults.map(r => r.value).join(YAML_DOCUMENT_DELIMITER_NEW_LINE);
        const previewResult = createPreviewResult(allYaml, configPath, 'Get Cluster Resources');

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

            console.log('previewResult1', previewResult);
            return previewResult;
          }
        }
        console.log('previewResult2', previewResult);
        return previewResult;
      },
      reason => {
        return createPreviewRejection(thunkAPI, 'Cluster Resources Failed', reason.message);
      }
    );
  } catch (e: any) {
    return createPreviewRejection(thunkAPI, 'Cluster Resources Failed', e.message);
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
