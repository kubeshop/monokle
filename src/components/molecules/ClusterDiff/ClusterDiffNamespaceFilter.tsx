import React, {useMemo} from 'react';
import {useAppSelector} from '@redux/hooks';
import styled from 'styled-components';
import ResourceNamespaceFilter from '../ResourceNamespaceFilter';

const NamespaceFilterContainer = styled.div`
  display: flex;
  align-items: center;
  width: 300px;
`;

const NamespaceFilterLabel = styled.span`
  margin-right: 10px;
`;

function ClusterDiffNamespaceFilter() {
  const clusterToLocalResourcesMatches = useAppSelector(state => state.main.clusterDiff.clusterToLocalResourcesMatches);

  const clusterDiffNamespaces = useMemo(() => {
    const namespaces: string[] = ['<all>'];
    clusterToLocalResourcesMatches.forEach(resourceMatch => {
      if (!namespaces.includes(resourceMatch.resourceNamespace)) {
        namespaces.push(resourceMatch.resourceNamespace);
      }
    });
    return namespaces;
  }, [clusterToLocalResourcesMatches]);

  return (
    <NamespaceFilterContainer>
      <NamespaceFilterLabel>Namespace:</NamespaceFilterLabel>{' '}
      <ResourceNamespaceFilter customNamespaces={clusterDiffNamespaces} />
    </NamespaceFilterContainer>
  );
}

export default ClusterDiffNamespaceFilter;
