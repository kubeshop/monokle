import {size} from 'lodash';

import {useAppSelector} from '@redux/hooks';
import {errorsSelector, useValidationSelector, warningsSelector} from '@redux/validation/validation.selectors';

import * as S from './Status.styled';

export const Status = () => {
  const clusterResourceCount = useAppSelector(state => size(state.main.resourceMetaMapByStorage.cluster));
  const errors = useValidationSelector(errorsSelector);
  const warnings = useValidationSelector(warningsSelector);

  return (
    <S.Container>
      <S.KindRow $type="resource">
        <S.Count>{clusterResourceCount}</S.Count>
        <span>resources</span>
      </S.KindRow>
      <S.InnerContainer>
        <S.KindRow $type="error" style={{width: '48.5%'}}>
          <S.Count>{size(errors)}</S.Count>
          <span>errors</span>
        </S.KindRow>
        <S.KindRow $type="warning" style={{width: '48.5%'}}>
          <S.Count>{size(warnings)}</S.Count>
          <span>warnings</span>
        </S.KindRow>
      </S.InnerContainer>
    </S.Container>
  );
};
