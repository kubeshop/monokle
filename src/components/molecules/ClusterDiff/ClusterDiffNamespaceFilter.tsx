import {useMemo} from 'react';

import {useAppSelector} from '@redux/hooks';

import ResourceNamespaceFilter from '../ResourceNamespaceFilter';
import * as S from './ClusterDiffNamespaceFilter.styled';

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
    <S.NamespaceFilterContainer>
      <S.NamespaceFilterLabel>Namespace:</S.NamespaceFilterLabel>
      <ResourceNamespaceFilter customNamespaces={clusterDiffNamespaces} />
    </S.NamespaceFilterContainer>
  );
}

export default ClusterDiffNamespaceFilter;
