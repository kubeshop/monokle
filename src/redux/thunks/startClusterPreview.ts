import {createAsyncThunk} from '@reduxjs/toolkit';

import {AppDispatch} from '@models/appdispatch';
import {RootState} from '@models/rootstate';

import {stopPreview} from '@redux/services/preview';

import {openKubectlProxy} from '@utils/commands/kubectl';

import {previewCluster, repreviewCluster} from './previewCluster';

export type StartClusterPreviewPayload = {
  clusterContext: string;
  isRestart?: boolean;
};

const PROXY_PORT_REGEX = /127.0.0.1:[0-9]+/;

export const startClusterPreview = createAsyncThunk<
  void,
  StartClusterPreviewPayload,
  {dispatch: AppDispatch; state: RootState}
>('main/startClusterPreview', async (payload, thunkAPI) => {
  const {clusterContext, isRestart} = payload;

  const shouldUseKubectlProxy = thunkAPI.getState().config.useKubectlProxy;

  if (!shouldUseKubectlProxy) {
    if (isRestart) {
      thunkAPI.dispatch(repreviewCluster({context: clusterContext}));
    } else {
      thunkAPI.dispatch(previewCluster({context: clusterContext}));
    }

    return;
  }

  // TODO: if the listener has not been called in 10 seconds, then stop the preview and send an error notification
  const kubectlProxyListener = (event: any) => {
    if (event.type === 'error' || event.type === 'exit') {
      stopPreview(thunkAPI.dispatch);
      return;
    }

    if (event.type === 'stdout' && event.result && event.result.data) {
      const proxyPortMatches = PROXY_PORT_REGEX.exec(event.result.data);
      const proxyPortString = proxyPortMatches?.[0]?.split(':')[1];
      const proxyPort = proxyPortString ? parseInt(proxyPortString, 10) : undefined;

      if (!proxyPort) {
        return;
      }

      if (isRestart) {
        thunkAPI.dispatch(repreviewCluster({context: clusterContext, port: proxyPort}));
      } else {
        thunkAPI.dispatch(previewCluster({context: clusterContext, port: proxyPort}));
      }
    }
  };

  openKubectlProxy(kubectlProxyListener);
});
