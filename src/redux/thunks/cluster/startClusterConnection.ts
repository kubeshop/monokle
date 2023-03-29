import {createAsyncThunk} from '@reduxjs/toolkit';

import {disconnectFromCluster} from '@redux/services/clusterResourceWatcher';

import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';

import {loadClusterResources, reloadClusterResources} from './loadClusterResources';

export type StartClusterConnectionPayload = {
  context: string;
  // TODO: maybe this should be required to catch all places where it should be passed?..
  namespace?: string;
  isRestart?: boolean;
};

// const PROXY_PORT_REGEX = /127.0.0.1:[0-9]+/;

export const startClusterConnection = createAsyncThunk<
  void,
  StartClusterConnectionPayload,
  {dispatch: AppDispatch; state: RootState}
>('main/startClusterConnection', async (payload, thunkAPI) => {
  const {context, namespace, isRestart} = payload;

  const clusterProxyPort = thunkAPI.getState().config.clusterProxyPort;
  const shouldUseKubectlProxy = thunkAPI.getState().config.useKubectlProxy;

  if (isRestart) {
    disconnectFromCluster();
  }

  if (!shouldUseKubectlProxy) {
    if (isRestart) {
      thunkAPI.dispatch(reloadClusterResources({context, namespace}));
    } else {
      thunkAPI.dispatch(loadClusterResources({context, namespace}));
    }

    return;
  }

  if (clusterProxyPort) {
    if (isRestart) {
      thunkAPI.dispatch(reloadClusterResources({context, namespace, port: clusterProxyPort}));
    } else {
      thunkAPI.dispatch(loadClusterResources({context, namespace, port: clusterProxyPort}));
    }
  }

  // TODO: if the listener has not been called in 10 seconds, then stop the preview and send an error notification
  // const kubectlProxyListener = (event: any) => {
  //   if (event.type === 'stderr' || event.type === 'exit') {
  //     stopPreview(thunkAPI.dispatch);

  //     if (event.type === 'stderr') {
  //       thunkAPI.dispatch(
  //         setAlert({type: AlertEnum.Error, title: 'Cluster Resources Failed', message: event.result.data})
  //       );
  //     }

  //     return;
  //   }

  //   if (event.type === 'stdout' && event.result && event.result.data) {
  //     const proxyPortMatches = PROXY_PORT_REGEX.exec(event.result.data);
  //     const proxyPortString = proxyPortMatches?.[0]?.split(':')[1];
  //     const proxyPort = proxyPortString ? parseInt(proxyPortString, 10) : undefined;

  //     if (!proxyPort) {
  //       return;
  //     }

  //     if (isRestart) {
  //       thunkAPI.dispatch(reloadClusterResources({context, namespace, port: proxyPort}));
  //     } else {
  //       thunkAPI.dispatch(loadClusterResources({context, namespace, port: proxyPort}));
  //     }
  //   }
  // };
  // const kubeConfigPath = kubeConfigPathSelector(thunkAPI.getState());
  // openKubectlProxy(kubectlProxyListener, {kubeConfigPath});
});
