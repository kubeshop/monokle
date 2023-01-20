import {createAsyncThunk} from '@reduxjs/toolkit';

import {setClusterProxyPort} from '@redux/reducers/appConfig';
import {stopPreview} from '@redux/services/preview';

import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';
import {openKubectlProxy} from '@shared/utils/commands/kubectl';

import {loadClusterResources, reloadClusterResources} from './loadCluster';

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

  const clusterProxyPort = thunkAPI.getState().config.clusterProxyPort;
  const shouldUseKubectlProxy = thunkAPI.getState().config.useKubectlProxy;

  if (!shouldUseKubectlProxy) {
    if (isRestart) {
      thunkAPI.dispatch(reloadClusterResources({context: clusterContext}));
    } else {
      thunkAPI.dispatch(loadClusterResources({context: clusterContext}));
    }

    return;
  }

  if (clusterProxyPort) {
    if (isRestart) {
      thunkAPI.dispatch(reloadClusterResources({context: clusterContext, port: clusterProxyPort}));
    } else {
      thunkAPI.dispatch(loadClusterResources({context: clusterContext, port: clusterProxyPort}));
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

      thunkAPI.dispatch(setClusterProxyPort(proxyPort));

      if (isRestart) {
        thunkAPI.dispatch(reloadClusterResources({context: clusterContext, port: proxyPort}));
      } else {
        thunkAPI.dispatch(loadClusterResources({context: clusterContext, port: proxyPort}));
      }
    }
  };

  openKubectlProxy(kubectlProxyListener);
});
