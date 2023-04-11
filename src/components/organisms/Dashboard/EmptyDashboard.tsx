import {useCallback, useEffect, useRef, useState} from 'react';

import {QuestionCircleFilled} from '@ant-design/icons';

import {motion, useAnimationControls} from 'framer-motion';
import styled from 'styled-components';

import {selectCurrentContextId, useClusterSelector} from '@redux/cluster/selectors';
import {pingCluster} from '@redux/cluster/thunks/ping';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {ContextId, MonokleClusterError} from '@shared/ipc';
import {Colors} from '@shared/styles';
import {openUrlInExternalBrowser} from '@shared/utils/shell';

import {ClusterIndication} from './Disconnected/ClusterIndication';
import ClusterFigure from './Disconnected/ConnectIcon.svg';
import {DebugClusterDrawer} from './Disconnected/DebugClusterDrawer';
import * as S from './EmptyDashboard.styled';

export const EmptyDashboard = () => {
  const dispatch = useAppDispatch();
  const contextId = useAppSelector(selectCurrentContextId);
  const [debug, setDebug] = useState(false);

  const toggleDebug = useCallback(
    (newDebug?: boolean) => {
      if (newDebug === undefined) {
        setDebug(!debug);
      } else {
        setDebug(newDebug);
      }
    },
    [setDebug, debug]
  );

  const closeDebug = useCallback(() => {
    toggleDebug(false);
  }, [toggleDebug]);

  useEffect(() => {
    dispatch(pingCluster());
  }, [contextId, dispatch]);

  return (
    <S.Container>
      <ClusterIndication />

      <Center>
        <div style={{width: 60, height: 42}}>
          <img src={ClusterFigure} />
        </div>

        <Header>Connect to your cluster</Header>

        <p>
          Monokle automatically detects and updates your Kubeconfig file. You can also go to your <a>Settings</a> to
          declare them manually.
        </p>

        <HelpMessage>
          <p style={{marginBottom: 4}}>
            <QuestionCircleFilled /> Help & Tips
          </p>
          <p>
            <a>Learn more</a> about cluster insights. Looking for help? Reach out to us in <a>our Discord channel</a> -
            we are glad to help you.
          </p>
        </HelpMessage>

        <ErrorMessage contextId={contextId} onDebug={() => toggleDebug(true)} />
      </Center>

      <DebugClusterDrawer contextId={contextId} open={debug} onClose={closeDebug} />
    </S.Container>
  );
};

function ErrorMessage({onDebug}: {contextId?: ContextId; onDebug: () => void}) {
  const controls = useAnimationControls();
  const previousErrorRef = useRef<MonokleClusterError | undefined>(undefined);
  const proxyError = useClusterSelector(s => s.proxyError);

  useEffect(() => {
    if (
      proxyError &&
      previousErrorRef.current &&
      previousErrorRef.current?.context === proxyError?.context &&
      previousErrorRef.current?.code === proxyError?.code
    ) {
      controls.start({scale: 1.04}).then(() => controls.start({scale: 1}));
    }
    previousErrorRef.current = proxyError;
  }, [controls, proxyError]);

  if (!proxyError) {
    return null;
  }

  return (
    <motion.div animate={controls}>
      <ErrorContent>
        {proxyError.title}
        {proxyError?.context ? <> of {proxyError?.context}</> : null}. {proxyError.description}{' '}
        <a onClick={onDebug}>View debug logs</a>
        {proxyError.learnMoreUrl ? (
          <>
            {' '}
            or{' '}
            <a onClick={() => openUrlInExternalBrowser(proxyError.learnMoreUrl)} target="_blank">
              learn more
            </a>
          </>
        ) : null}
      </ErrorContent>
    </motion.div>
  );
}

const Center = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 180px;
  max-width: 500px;
`;

const Header = styled.h1`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 29px;
  color: ${Colors.grey9};
`;

const ErrorContent = styled.p`
  color: ${Colors.red7};
`;

const HelpMessage = styled.div`
  color: ${Colors.grey7};
`;
