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
      .filter(r => (selectedNamespace !== 'ALL' ? selectedNamespace === r.namespace : true)).length;
  }, [resourceMap, selectedNamespace]);

  const getErrorCount = useCallback(() => {
    return Object.values(resourceMap)
      .filter((resource: K8sResource) => resource.filePath.startsWith('preview://'))
      .filter(resource => (selectedNamespace !== 'ALL' ? selectedNamespace === resource.namespace : true))
      .reduce(
        (total: number, resource: K8sResource) =>
          total + (resource.validation && resource.validation.errors ? resource.validation.errors.length : 0),
        0
      );
  }, [resourceMap, selectedNamespace]);

  const getWarningCount = useCallback(() => {
    return Object.values(resourceMap)
      .filter((resource: K8sResource) => resource.filePath.startsWith('preview://'))
      .filter(resource => (selectedNamespace !== 'ALL' ? selectedNamespace === resource.namespace : true))
      .reduce(
        (total: number, resource: K8sResource) =>
          total + (resource.issues && resource.issues.errors ? resource.issues.errors.length : 0),
        0
      );
  }, [resourceMap, selectedNamespace]);

  return (
    <S.Container>
      <S.KindRow $type="resource">
        <S.Count>{getResourceCount()}</S.Count>
        <span>resources</span>
      </S.KindRow>
      <S.InnerContainer>
        <S.KindRow $type="error" style={{marginRight: '8px'}}>
          <S.Count>{getErrorCount()}</S.Count>
          <span>errors</span>
        </S.KindRow>
        <S.KindRow $type="warning" style={{marginLeft: '8px'}}>
          <S.Count>{getWarningCount()}</S.Count>
          <span>warnings</span>
        </S.KindRow>
      </S.InnerContainer>
    </S.Container>
  );
};
