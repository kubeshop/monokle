import {stringify} from 'yaml';

import {SetDiffDataPayload} from '@redux/reducers/main';
import {AppDispatch, RootState} from '@redux/store';
import {createRejectionWithAlert, getResourceFromCluster} from '@redux/thunks/utils';
import {createAsyncThunk} from '@reduxjs/toolkit';

import {getResourceKindHandler} from '@src/kindhandlers';

import * as k8s from '@kubernetes/client-node';

/**
 * Thunk to diff a resource against the configured cluster
 */

export const performResourceDiff = createAsyncThunk<
  SetDiffDataPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/setDiffContent', async (diffResourceId, thunkAPI) => {
  const resourceMap = thunkAPI.getState().main.resourceMap;
  const kubeconfig = thunkAPI.getState().config.kubeconfigPath;
  try {
    const resource = resourceMap[diffResourceId];

    if (resource && resource.text) {
      const resourceKindHandler = getResourceKindHandler(resource.kind);
      if (!resourceKindHandler) {
        return createRejectionWithAlert(
          thunkAPI,
          'Diff Resource',
          `Could not find Kind Handler for resoruce ${resource.id}`
        );
      }

      const kc = new k8s.KubeConfig();
      kc.loadFromFile(kubeconfig);

      const handleResource = (res: any) => {
        if (res.body) {
          delete res.body.metadata?.managedFields;
          return {diffContent: stringify(res.body, {sortMapEntries: true}), diffResourceId};
        }

        return createRejectionWithAlert(
          thunkAPI,
          'Diff Resources',
          `Failed to get ${resource.content.kind} from cluster`
        );
      };

      const handleRejection = (rej: any) => {
        let message = `${resource.content.kind} ${resource.content.metadata.name} not found in cluster`;
        let title = 'Diff failed';

        return createRejectionWithAlert(thunkAPI, title, message);
      };

      try {
        const resourceFromCluster = await getResourceFromCluster(resource, kubeconfig);
        return handleResource(resourceFromCluster);
      } catch (err) {
        return handleRejection(err);
      }
    }
  } catch (e: any) {
    return createRejectionWithAlert(thunkAPI, 'Diff Resource', `Failed to diff resources; ${e.message}`);
  }

  return {};
});
