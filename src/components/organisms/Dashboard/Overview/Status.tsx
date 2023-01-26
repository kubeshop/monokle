import {useCallback} from 'react';

import {size} from 'lodash';

import {useAppSelector} from '@redux/hooks';
import {resourceMapSelector} from '@redux/selectors';

import * as S from './Status.styled';

export const Status = () => {
  const clusterResourceMap = useAppSelector(state => resourceMapSelector(state, 'cluster'));

  const getResourceCount = useCallback(() => {
    return size(clusterResourceMap);
  }, [clusterResourceMap]);

  // TODO: re-implement this after @monokle/validation
  const getErrorCount = useCallback(() => {
    // return Object.values(clusterResourceMap)
    //   .reduce((total: number, resource: K8sResource) => {
    //     if (resource.issues && resource.issues.errors) {
    //       total += resource.issues.errors.length;
    //     }
    //     if (resource.validation && resource.validation.errors) {
    //       total += resource.validation.errors.length;
    //     }
    //     return total;
    //   }, 0);
    return 0;
  }, [clusterResourceMap]);

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
