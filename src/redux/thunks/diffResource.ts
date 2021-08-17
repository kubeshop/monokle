import {createAsyncThunk} from '@reduxjs/toolkit';
import {SetDiffDataPayload} from '@redux/reducers/main';
import {AppDispatch, RootState} from '@redux/store';
import * as k8s from '@kubernetes/client-node';
import {stringify} from 'yaml';
import log from 'loglevel';
import {createPreviewRejection} from '@redux/thunks/utils';

import {getResourceKindHandler} from '@src/kindhandlers';

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
    const resourceKindHandler = getResourceKindHandler(resource.kind);

    if (resource && resource.text && resourceKindHandler) {
      const kc = new k8s.KubeConfig();
      kc.loadFromFile(kubeconfig);

      const handleResource = (res: any) => {
        if (res.body) {
          delete res.body.metadata?.managedFields;
          return {diffContent: stringify(res.body, {sortMapEntries: true}), diffResourceId};
        }

        return createPreviewRejection(
          thunkAPI,
          'Diff Resources',
          `Failed to get ${resource.content.kind} from cluster`
        );
      };

      const handleRejection = (rej: any) => {
        let message = `${resource.content.kind} ${resource.content.metadata.name} not found in cluster`;
        let title = 'Diff failed';

        return createPreviewRejection(thunkAPI, title, message);
      };

      return resourceKindHandler
        .getResourceFromCluster(kc, resource.content.metadata.name, resource.namespace ? resource.namespace : 'default')
        .then(handleResource, handleRejection);
    }
  } catch (e) {
    createPreviewRejection(thunkAPI, 'Diff Resource', `Failed to diff resources; ${e.message}`);
    log.error(e);
  }

  return {};
});
