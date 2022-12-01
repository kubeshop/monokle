import {useCallback} from 'react';

import {K8sResource} from '@models/k8sresource';

import {useAppSelector} from '@redux/hooks';

import * as S from './Status.styled';

export const Status = () => {
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedNamespace = useAppSelector(state => state.dashboard.ui.selectedNamespace);

  const getResourceCount = useCallback(() => {
    return Object.values(resourceMap)
      .filter((resource: K8sResource) => resource.filePath.startsWith('preview://'))
      .filter(r => (selectedNamespace !== 'ALL' && Boolean(r.namespace) ? selectedNamespace === r.namespace : true))
      .length;
  }, [resourceMap, selectedNamespace]);

  const getErrorCount = useCallback(() => {
    return Object.values(resourceMap)
      .filter((resource: K8sResource) => resource.filePath.startsWith('preview://'))
      .filter(resource =>
        selectedNamespace !== 'ALL' && Boolean(resource.namespace) ? selectedNamespace === resource.namespace : true
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
  }, [resourceMap, selectedNamespace]);

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
