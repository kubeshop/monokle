import {intersection, size} from 'lodash';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLeftMenuSelection} from '@redux/reducers/ui';
import {filteredResourcesIdsSelector} from '@redux/selectors/resourceSelectors';
import {
  errorsResourcesIdsSelector,
  useValidationSelector,
  warningsResourcesIdsSelector,
} from '@redux/validation/validation.selectors';
import {setValidationFilters} from '@redux/validation/validation.slice';

import {useRefSelector} from '@utils/hooks';

import {ProblemIcon} from '@monokle/components';

import * as S from './NavigatorDescription.styled';

const NavigatorDescription: React.FC = () => {
  const dispatch = useAppDispatch();
  const errorsResourcesIds = useValidationSelector(state => errorsResourcesIdsSelector(state));
  const warningsResourcesIds = useValidationSelector(state => warningsResourcesIdsSelector(state));

  const filteredResources = useAppSelector(filteredResourcesIdsSelector);

  const errorsCount = size(intersection(errorsResourcesIds, filteredResources));
  const warningsCount = size(intersection(warningsResourcesIds, filteredResources));
  const resourceCount = size(filteredResources);

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
