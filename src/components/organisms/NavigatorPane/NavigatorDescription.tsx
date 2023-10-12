import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLeftMenuSelection} from '@redux/reducers/ui';
import {navigatorResourcesCountSelector} from '@redux/selectors/resourceSelectors';
import {
  errorsByResourcesFilterCountSelector,
  warningsByResourcesFilterCountSelector,
} from '@redux/validation/validation.selectors';
import {setValidationFilters} from '@redux/validation/validation.slice';

import {useRefSelector} from '@utils/hooks';

import {ProblemIcon} from '@monokle/components';
import {isInPreviewModeSelector} from '@shared/utils';

import * as S from './NavigatorDescription.styled';

const NavigatorDescription: React.FC = () => {
  const dispatch = useAppDispatch();
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const navigatorResourcesCount = useAppSelector(navigatorResourcesCountSelector);

  const errorsCount = useAppSelector(errorsByResourcesFilterCountSelector);
  const warningsCount = useAppSelector(warningsByResourcesFilterCountSelector);

  const currentFilters = useRefSelector(state => state.validation.validationOverview.filters);

  const handleSetFilters = (type: 'warning' | 'error') => {
    dispatch(setValidationFilters({...currentFilters.current, type}));
    dispatch(setLeftMenuSelection('validation'));
  };

  return (
    <S.NavigatorDescriptionContainer>
      {navigatorResourcesCount ? (
        <>
          <S.ResourcesCount $isPreview={isInPreviewMode}>{navigatorResourcesCount} objects</S.ResourcesCount>
          <S.WarningsErrorsContainer>
            <S.ProblemCountContainer onClick={() => handleSetFilters('error')}>
              <ProblemIcon level="error" /> <S.Count $type="error">{errorsCount}</S.Count>
            </S.ProblemCountContainer>

            <S.ProblemCountContainer onClick={() => handleSetFilters('warning')}>
              <ProblemIcon level="warning" /> <S.Count $type="warning">{warningsCount}</S.Count>
            </S.ProblemCountContainer>
          </S.WarningsErrorsContainer>
        </>
      ) : (
        <S.ResourcesCount $isPreview={isInPreviewMode}>No objects found</S.ResourcesCount>
      )}
    </S.NavigatorDescriptionContainer>
  );
};

export default NavigatorDescription;
