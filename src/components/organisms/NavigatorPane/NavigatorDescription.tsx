import {size} from 'lodash';

import {useAppSelector} from '@redux/hooks';
import {getActiveResourceMetaMapFromState} from '@redux/selectors/resourceMapGetters';
import {isKustomizationPatch, isKustomizationResource} from '@redux/services/kustomize';
import {errorsSelector, useValidationSelector, warningsSelector} from '@redux/validation/validation.selectors';

import {isResourcePassingFilter} from '@utils/resources';

import {ProblemIcon} from '@monokle/components';

import * as S from './NavigatorDescription.styled';

const NavigatorDescription: React.FC = () => {
  const errorsCount = useValidationSelector(state => size(errorsSelector(state)));
  const warningsCount = useValidationSelector(state => size(warningsSelector(state)));
  const resourceCount = useAppSelector(state =>
    size(
      Object.values(getActiveResourceMetaMapFromState(state)).filter(
        r =>
          r.kind &&
          isResourcePassingFilter(r, state.main.resourceFilter) &&
          !isKustomizationResource(r) &&
          !isKustomizationPatch(r)
      )
    )
  );

  return (
    <S.NavigatorDescriptionContainer>
      <S.ResourcesCount>{resourceCount} objects</S.ResourcesCount>

      <S.WarningsErrorsContainer>
        <ProblemIcon level="error" /> <S.Count $type="error">{errorsCount}</S.Count>
        <ProblemIcon level="warning" /> <S.Count $type="warning">{warningsCount}</S.Count>
      </S.WarningsErrorsContainer>
    </S.NavigatorDescriptionContainer>
  );
};

export default NavigatorDescription;
