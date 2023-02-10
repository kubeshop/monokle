import {size} from 'lodash';

import {useAppSelector} from '@redux/hooks';
import {clusterResourceMapSelector} from '@redux/selectors/resourceMapSelectors';
import {problemsSelector, useValidationSelector} from '@redux/validation/validation.selectors';

import * as S from './Status.styled';

export const Status = () => {
  const clusterResourceMap = useAppSelector(clusterResourceMapSelector);
  const problems = useValidationSelector(problemsSelector);

  return (
    <S.Container>
      <S.KindRow $type="resource">
        <S.Count>{size(clusterResourceMap)}</S.Count>
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
