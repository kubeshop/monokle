import {useCallback, useEffect, useState} from 'react';

import {Button, Spin} from 'antd';

import {ApiOutlined, CloseCircleFilled, LoadingOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {kubeConfigContextSelector, kubeConfigPathSelector, kubeConfigPathValidSelector} from '@redux/appConfig';
import {connectCluster} from '@redux/cluster/thunks/connect';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {toggleStartProjectPane} from '@redux/reducers/ui';
import {stopClusterConnection} from '@redux/thunks/cluster';

import {Tooltip} from '@components/atoms/Tooltip/Tooltip';

import {Colors} from '@shared/styles';

export function ConnectButton() {
  const dispatch = useAppDispatch();
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const clusterConnection = useAppSelector(state => state.main.clusterConnection);
  const clusterConnectionOptions = useAppSelector(state => state.main.clusterConnectionOptions);
  const lastNamespaceLoaded = clusterConnectionOptions.lastNamespaceLoaded;
  const [isClusterActionDisabled, setIsClusterActionDisabled] = useState(
    Boolean(!kubeConfigPath) || !isKubeConfigPathValid
  );
  const loading = Boolean(clusterConnectionOptions.isLoading);

  useEffect(() => {
    setIsClusterActionDisabled(Boolean(!kubeConfigPath) || !isKubeConfigPathValid);
  }, [kubeConfigPath, isKubeConfigPathValid]);

  const loadOrReload = async () => {
    if (isClusterActionDisabled && loading) {
      return;
    }

    if (isStartProjectPaneVisible) {
      dispatch(toggleStartProjectPane());
    }

    dispatch(
      connectCluster({
        context: kubeConfigContext,
        namespace: lastNamespaceLoaded,
        reload: clusterConnection !== undefined,
      })
    );
  };

  if (loading) {
    return (
      <ConnectBtn>
        <Spin indicator={<LoadingOutlined style={{fontSize: 15, color: 'white'}} spin />} />
      </ConnectBtn>
    );
  }

  return (
    <Tooltip title="Connect to cluster">
      <ConnectBtn className={highlightedItems.connectToCluster ? 'animated-highlight' : ''} onClick={loadOrReload}>
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
  border-color: ${Colors.geekblue7};
  background-color: ${Colors.geekblue7};
`;

const CloseBtn = styled(SquareBtn)`
  min-width: 20px;
  border: none;
  color: ${Colors.geekblue7};
`;
