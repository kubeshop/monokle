import {size} from 'lodash';

import {errorsSelector, useValidationSelector, warningsSelector} from '@redux/validation/validation.selectors';

import {ProblemIcon} from '@monokle/components';

import * as S from './NavigatorTitle.styled';

const NavigatorTitle: React.FC = () => {
  const errorsCount = useValidationSelector(state => size(errorsSelector(state)));
  const warningsCount = useValidationSelector(state => size(warningsSelector(state)));

  return (
    <S.NavigatorTitleContainer>
      Kubernetes Resources
      <S.WarningsErrorsContainer>
        <ProblemIcon level="error" /> <S.Count $type="error">{errorsCount}</S.Count>
        <ProblemIcon level="warning" /> <S.Count $type="warning">{warningsCount}</S.Count>
      </S.WarningsErrorsContainer>
    </S.NavigatorTitleContainer>
  );
};

export default NavigatorTitle;
