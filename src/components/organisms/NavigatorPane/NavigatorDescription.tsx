import {size} from 'lodash';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLeftMenuSelection} from '@redux/reducers/ui';
import {getActiveResourceMetaMapFromState} from '@redux/selectors/resourceMapGetters';
import {isKustomizationPatch, isKustomizationResource} from '@redux/services/kustomize';
import {errorsSelector, useValidationSelector, warningsSelector} from '@redux/validation/validation.selectors';
import {setValidationFilters} from '@redux/validation/validation.slice';

import {useRefSelector} from '@utils/hooks';
import {isResourcePassingFilter} from '@utils/resources';

import {ProblemIcon} from '@monokle/components';

import * as S from './NavigatorDescription.styled';

const NavigatorDescription: React.FC = () => {
  const dispatch = useAppDispatch();
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
  const currentFilters = useRefSelector(state => state.validation.validationOverview.filters);

  const handleSetFilters = (type: 'warning' | 'error') => {
    dispatch(setValidationFilters({...currentFilters.current, type}));
    dispatch(setLeftMenuSelection('validation'));
  };

  return (
    <S.NavigatorDescriptionContainer>
      <S.ResourcesCount>{resourceCount} objects</S.ResourcesCount>

      <S.WarningsErrorsContainer>
        <S.ProblemCountContainer onClick={() => handleSetFilters('error')}>
          <ProblemIcon level="error" /> <S.Count $type="error">{errorsCount}</S.Count>
        </S.ProblemCountContainer>

        <S.ProblemCountContainer onClick={() => handleSetFilters('warning')}>
          <ProblemIcon level="warning" /> <S.Count $type="warning">{warningsCount}</S.Count>
        </S.ProblemCountContainer>
      </S.WarningsErrorsContainer>
    </S.NavigatorDescriptionContainer>
  );
};

export default NavigatorDescription;
