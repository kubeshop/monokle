import {size} from 'lodash';

import {useAppSelector} from '@redux/hooks';
import {problemsSelector, useValidationSelector} from '@redux/validation/validation.selectors';

import * as S from './Status.styled';

export const Status = () => {
  const clusterResourceCount = useAppSelector(state => size(state.main.resourceMetaMapByStorage.cluster));
  const problems = useValidationSelector(problemsSelector);

  return (
    <S.Container>
      <S.KindRow $type="resource">
        <S.Count>{clusterResourceCount}</S.Count>
        <span>resources</span>
      </S.KindRow>
      <S.InnerContainer>
        <S.KindRow $type="error">
          <S.Count>{size(problems)}</S.Count>
          <span>errors</span>
        </S.KindRow>
      </S.InnerContainer>
    </S.Container>
  );
};
