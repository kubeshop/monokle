import {useCallback} from 'react';

import {K8sResource} from '@models/k8sresource';

import {useAppSelector} from '@redux/hooks';

import * as S from './Status.styled';

export const Status = () => {
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedNamespaces = useAppSelector(state => state.dashboard.ui.selectedNamespaces);

  const getResourceCount = useCallback(() => {
    return Object.values(resourceMap)
      .filter((resource: K8sResource) => resource.filePath.startsWith('preview://'))
      .filter(r =>
        selectedNamespaces.length > 0 && Boolean(r.namespace) ? selectedNamespaces.find(n => n === r.namespace) : true
      ).length;
  }, [resourceMap, selectedNamespaces]);

  const getErrorCount = useCallback(() => {
    return Object.values(resourceMap)
      .filter((resource: K8sResource) => resource.filePath.startsWith('preview://'))
      .filter(resource =>
        selectedNamespaces.length > 0 && Boolean(resource.namespace)
          ? selectedNamespaces.find(n => n === resource.namespace)
          : true
      )
      .reduce((total: number, resource: K8sResource) => {
        if (resource.issues && resource.issues.errors) {
          total += resource.issues.errors.length;
        }
        if (resource.validation && resource.validation.errors) {
          total += resource.validation.errors.length;
        }
        return total;
      }, 0);
  }, [resourceMap, selectedNamespaces]);

  return (
    <S.Container>
      <S.KindRow $type="resource">
        <S.Count>{getResourceCount()}</S.Count>
        <span>resources</span>
      </S.KindRow>
      <S.InnerContainer>
        <S.KindRow $type="error">
          <S.Count>{getErrorCount()}</S.Count>
          <span>errors</span>
        </S.KindRow>
      </S.InnerContainer>
    </S.Container>
  );
};
