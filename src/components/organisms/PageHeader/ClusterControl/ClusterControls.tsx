import {useHotkeys} from 'react-hotkeys-hook';

import styled from 'styled-components';

import {activeProjectSelector, isInClusterModeSelector, kubeConfigContextSelector} from '@redux/appConfig';
import {connectCluster} from '@redux/cluster/thunks/connect';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {hotkeys} from '@shared/constants/hotkeys';
import {defineHotkey} from '@shared/utils';

import {ConnectButton, ExitButton} from './Buttons';
import {ContextSelect} from './ContextSelect';
import {NamespaceSelect} from './NamespaceSelect';

export function ClusterControls() {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const isInQuickClusterMode = useAppSelector(state => state.ui.isInQuickClusterMode);

  const reconnectToCluster = (namespace?: string) => {
    dispatch(connectCluster({context: kubeConfigContext, namespace, reload: true}));
  };

  useHotkeys(defineHotkey(hotkeys.RELOAD_PREVIEW.key), () => {
    reconnectToCluster();
  });

  if (!activeProject && !isInQuickClusterMode) {
    return null;
  }

  return (
    <Box>
      <ContextSelect />
      {isInClusterMode ? <NamespaceSelect /> : null}
      {isInClusterMode ? <ExitButton /> : <ConnectButton />}
    </Box>
  );
}

const Box = styled.div`
  display: flex;
  gap: 8px;
`;
