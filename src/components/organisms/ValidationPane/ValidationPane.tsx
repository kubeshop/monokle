import {useMeasure} from 'react-use';

import {Image} from 'antd';
import Link from 'antd/lib/typography/Link';

import {ReloadOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLeftMenuSelection} from '@redux/reducers/ui';
import {activeResourceStorageSelector} from '@redux/selectors/resourceMapSelectors';
import {activePluginsSelector, useValidationSelector} from '@redux/validation/validation.selectors';
import {setSelectedProblem, setValidationFilters} from '@redux/validation/validation.slice';
import {validateResources} from '@redux/validation/validation.thunks';

import {usePaneHeight} from '@hooks/usePaneHeight';

import {downloadJson} from '@utils/downloadJson';
import {useRefSelector} from '@utils/hooks';

import ValidationFigure from '@assets/NewValidationFigure.svg';

import {Icon, TitleBar, ValidationOverview} from '@monokle/components';
import {trackEvent} from '@shared/utils';
import {isInClusterModeSelector, isInPreviewModeSelector} from '@shared/utils/selectors';

import * as S from './ValidationPane.styled';

const ValidationPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const activePlugins = useValidationSelector(activePluginsSelector);
  const activeStorageRef = useRefSelector(activeResourceStorageSelector);
  const lastResponse = useValidationSelector(state => state.lastResponse);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
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
                Manage your validation policy and rules in the{' '}
                <Link onClick={() => dispatch(setLeftMenuSelection('settings'))}>settings</Link> section in the left
                menu.
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
          activePlugins={activePlugins}
          containerStyle={{marginTop: '20px'}}
          groupOnlyByResource={isInClusterMode || isInPreviewMode}
          filters={validationFilters}
          height={height - titleBarHeight - 60}
          newProblemsIntroducedType={newProblemsIntroducedType}
          selectedProblem={selectedProblem?.problem}
          validationResponse={lastResponse}
          onProblemSelect={problem => {
            dispatch(setSelectedProblem(problem));
            trackEvent('explore/select_problem', {
              ruleId: problem.problem.ruleId,
              source: activeStorageRef.current,
            });
          }}
          status={isInClusterMode ? 'loaded' : status}
          skeletonStyle={{marginTop: '20px'}}
          onFiltersChange={filters => dispatch(setValidationFilters(filters))}
          triggerValidationSettingsRedirectCallback={() => dispatch(setLeftMenuSelection('settings'))}
          downloadSarifResponseCallback={() => {
            downloadJson(lastResponse);
          }}
        />
      ) : (
        <S.ErrorEmptyMessageContainer>There are no errors or warnings found.</S.ErrorEmptyMessageContainer>
      )}
    </S.ValidationPaneContainer>
  );
};

export default ValidationPane;
