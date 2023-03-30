import {useMeasure} from 'react-use';

import {Image} from 'antd';
import Link from 'antd/lib/typography/Link';

import {ReloadOutlined} from '@ant-design/icons';

import {isInClusterModeSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLeftMenuSelection} from '@redux/reducers/ui';
import {activeResourceStorageSelector} from '@redux/selectors/resourceMapSelectors';
import {useValidationSelector} from '@redux/validation/validation.selectors';
import {setSelectedProblem, setValidationFilters} from '@redux/validation/validation.slice';
import {validateResources} from '@redux/validation/validation.thunks';

import {usePaneHeight} from '@hooks/usePaneHeight';

import {useRefSelector} from '@utils/hooks';

import ValidationFigure from '@assets/NewValidationFigure.svg';

import {Icon, TitleBar, ValidationOverview} from '@monokle/components';

import * as S from './ValidationPane.styled';

const ValidationPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeStorageRef = useRefSelector(activeResourceStorageSelector);
  const lastResponse = useValidationSelector(state => state.lastResponse);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const newProblemsIntroducedType = useValidationSelector(state => state.validationOverview.newProblemsIntroducedType);
  const selectedProblem = useValidationSelector(state => state.validationOverview.selectedProblem);
  const status = useValidationSelector(state => state.status);
  const validationFilters = useValidationSelector(state => state.validationOverview.filters);

  const [titleBarRef, {height: titleBarHeight}] = useMeasure<HTMLDivElement>();

  const height = usePaneHeight();

  return (
    <S.ValidationPaneContainer>
      <div ref={titleBarRef}>
        <TitleBar
          title={`Validation Overview ${isInClusterMode ? '( Cluster mode )' : ''}`}
          description={
            <S.DescriptionContainer>
              <Image src={ValidationFigure} width={95} />
              <div>
                Fix your resources according to your validation setup. Manage your validation policy, turn rules on or
                off, and more in the <Link onClick={() => dispatch(setLeftMenuSelection('settings'))}>settings</Link>{' '}
                section, located in the left menu.
                {isInClusterMode && (
                  <S.BackToDashboardButton
                    icon={<Icon name="cluster-dashboard" />}
                    type="primary"
                    onClick={() => dispatch(setLeftMenuSelection('dashboard'))}
                  >
                    Back to cluster dashboard
                  </S.BackToDashboardButton>
                )}
              </div>
            </S.DescriptionContainer>
          }
        />
      </div>

      {status === 'error' ? (
        <S.ErrorEmptyMessageContainer>
          <S.ErrorMessage>
            <S.ExclamationCircleOutlined /> <span>There was an error with validating your resources.</span>
          </S.ErrorMessage>

          <S.RevalidateButton
            icon={<ReloadOutlined />}
            type="primary"
            onClick={() => dispatch(validateResources({type: 'full', resourceStorage: activeStorageRef.current}))}
          >
            Try again
          </S.RevalidateButton>
        </S.ErrorEmptyMessageContainer>
      ) : lastResponse ? (
        <ValidationOverview
          containerStyle={{marginTop: '20px'}}
          showOnlyByResource={isInClusterMode}
          filters={validationFilters}
          height={height - titleBarHeight - 40}
          newProblemsIntroducedType={newProblemsIntroducedType}
          selectedProblem={selectedProblem?.problem}
          validationResponse={lastResponse}
          onProblemSelect={problem => dispatch(setSelectedProblem(problem))}
          status={status}
          skeletonStyle={{marginTop: '20px'}}
          onFiltersChange={filters => dispatch(setValidationFilters(filters))}
        />
      ) : (
        <S.ErrorEmptyMessageContainer>There are no errors or warnings found.</S.ErrorEmptyMessageContainer>
      )}
    </S.ValidationPaneContainer>
  );
};

export default ValidationPane;
