import {useCallback} from 'react';

import {useAppSelector} from '@redux/hooks';

import {K8sResource} from '@shared/models/k8sResource';

import * as S from './Status.styled';

export const Status = () => {
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  const getResourceCount = useCallback(() => {
    return Object.values(resourceMap).filter((resource: K8sResource) => resource.filePath.startsWith('preview://'))
      .length;
  }, [resourceMap]);

  const getErrorCount = useCallback(() => {
    return Object.values(resourceMap)
      .filter((resource: K8sResource) => resource.filePath.startsWith('preview://'))
      .reduce((total: number, resource: K8sResource) => {
        if (resource.issues && resource.issues.errors) {
          total += resource.issues.errors.length;
        }
        if (resource.validation && resource.validation.errors) {
          total += resource.validation.errors.length;
        }
        return total;
      }, 0);
  }, [resourceMap]);

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
