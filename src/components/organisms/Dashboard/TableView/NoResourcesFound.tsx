import {useMemo} from 'react';

import {Image} from 'antd';

import styled from 'styled-components';

import {activeProjectSelector} from '@redux/appConfig';
import {useAppSelector} from '@redux/hooks';

import NoDataFound from '@assets/NoDataFound.svg';

const NoResourcesFound: React.FC = () => {
  const activeProject = useAppSelector(activeProjectSelector);
  const lastLoadedNamespace = useAppSelector(state => state.main.clusterConnectionOptions.lastNamespaceLoaded);

  const quickTipText = useMemo(() => {
    if (activeProject) {
      return 'Quick tip: Create resources of any kind from scratch on your local project. You can then deploy them to your cluster.';
    }

    return 'Quick tip: Start a local project and create resources of any kind from scratch. You can then deploy them to your cluster.';
  }, [activeProject]);

  const notFoundtext = useMemo(() => {
    if (!lastLoadedNamespace || lastLoadedNamespace === '<all>' || lastLoadedNamespace === '<not-namespaced>') {
      return 'No resources found in cluster';
    }

    return (
      <>
        No resources found in namespace <b>{lastLoadedNamespace}</b>
      </>
    );
  }, [lastLoadedNamespace]);

  return (
    <Container>
      <Image src={NoDataFound} width={100} height={100} />
      <NotFoundText>{notFoundtext}</NotFoundText>
      <QuickTipText>{quickTipText}</QuickTipText>
    </Container>
  );
};

export default NoResourcesFound;

const Container = styled.div`
  margin: 50px 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const NotFoundText = styled.div``;

const QuickTipText = styled.div`
  font-size: 12px;
  max-width: 400px;
`;
