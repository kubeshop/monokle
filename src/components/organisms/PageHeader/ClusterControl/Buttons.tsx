import {useCallback} from 'react';

import {Button, Spin} from 'antd';

import {ApiOutlined, CloseCircleFilled, LoadingOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {getContext} from '@redux/cluster/selectors';
import {connectCluster} from '@redux/cluster/thunks/connect';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {toggleStartProjectPane} from '@redux/reducers/ui';
import {stopClusterConnection} from '@redux/thunks/cluster';

import {Tooltip} from '@components/atoms/Tooltip/Tooltip';

import {Colors} from '@shared/styles';
import {selectKubeconfig} from '@shared/utils/cluster/selectors';

export function ConnectButton() {
  const dispatch = useAppDispatch();
  const kubeConfig = useAppSelector(selectKubeconfig);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const clusterConnection = useAppSelector(state => state.main.clusterConnection);
  const clusterConnectionOptions = useAppSelector(state => state.main.clusterConnectionOptions);
  const loading = Boolean(clusterConnectionOptions.isLoading);

  const loadOrReload = useCallback(() => {
    const context = getContext(kubeConfig);
    if (!context || loading) {
      return;
    }

    if (isStartProjectPaneVisible) {
      dispatch(toggleStartProjectPane());
    }

    dispatch(
      connectCluster({
        context: context.name,
        namespace: clusterConnectionOptions.lastNamespaceLoaded,
        reload: clusterConnection !== undefined,
      })
    );
  }, [
    clusterConnection,
    clusterConnectionOptions.lastNamespaceLoaded,
    dispatch,
    isStartProjectPaneVisible,
    kubeConfig,
    loading,
  ]);

  if (loading) {
    return (
      <ConnectBtn>
        <Spin indicator={<LoadingOutlined style={{fontSize: 15, color: 'white'}} spin />} />
      </ConnectBtn>
    );
  }

  return (
    <Tooltip title="Connect to cluster">
      <ConnectBtn disabled={!kubeConfig?.isValid} onClick={loadOrReload}>
        <ApiOutlined />
      </ConnectBtn>
    </Tooltip>
  );
}

export function ExitButton() {
  const dispatch = useAppDispatch();

  const onClickExit = useCallback(() => {
    dispatch(stopClusterConnection());
  }, [dispatch]);

  return (
    <CloseBtn onClick={onClickExit}>
      <CloseCircleFilled style={{fontSize: 16, display: 'block', textAlign: 'center', paddingTop: 4}} />
    </CloseBtn>
  );
}

const SquareBtn = styled(Button)`
  border-radius: 4px;
  padding: 0px;
  height: 30px;
  min-width: 30px;
`;

const ConnectBtn = styled(SquareBtn)`
  border-color: ${Colors.blue6};
  background-color: ${Colors.blue6};
`;

const CloseBtn = styled(SquareBtn)`
  min-width: 20px;
  border: none;
  color: ${Colors.blue6};
`;
