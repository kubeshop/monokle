import {useMemo} from 'react';

import {Tooltip} from 'antd';

import {size} from 'lodash';

import {TOOLTIP_DELAY} from '@constants/constants';
import {ClusterDashboardErrorsWarningTooltip} from '@constants/tooltips';

import {setDashboardActiveAccordion} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLeftMenuSelection} from '@redux/reducers/ui';
import {useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';
import {problemsSelector, useValidationSelector} from '@redux/validation/validation.selectors';
import {setValidationFilters} from '@redux/validation/validation.slice';

import {useRefSelector} from '@utils/hooks';

import {trackEvent} from '@shared/utils';

import * as S from './Status.styled';

export const Status = () => {
  const dispatch = useAppDispatch();

  const currentFilters = useRefSelector(state => state.validation.validationOverview.filters);
  const problems = useValidationSelector(problemsSelector);
  const imagesCount = useAppSelector(state => size(state.main.imageMap));
  const helmReleases = useAppSelector(state => state.dashboard.helm.helmReleases || []);

  const clusterResourceCount = size(useResourceMetaMap('cluster'));

  const errorsCount = useMemo(() => size(problems.filter(p => p.level === 'error')), [problems]);
  const warningsCount = useMemo(() => size(problems.filter(p => p.level === 'warning')), [problems]);

  const handleSetFilters = (type: 'warning' | 'error') => {
    dispatch(setValidationFilters({...currentFilters.current, type}));
    dispatch(setLeftMenuSelection('validation'));
    trackEvent(type === 'error' ? 'dashboard/select_errors' : 'dashboard/select_warnings');
  };

  return (
    <S.Container>
      <S.KindRow $type="resource">
        <S.Count>
          <b>{clusterResourceCount}</b> resources
        </S.Count>
      </S.KindRow>

      <S.InnerContainer>
        <Tooltip title="Helm releases count" mouseEnterDelay={TOOLTIP_DELAY}>
          <S.KindRow
            $type="resource"
            style={{width: '48.5%'}}
            onClick={() => {
              dispatch(setDashboardActiveAccordion('helm-releases'));
              trackEvent('dashboard/select_helm');
            }}
          >
            <S.Count $small>
              <b>{helmReleases.length}</b> Helm Charts
            </S.Count>
          </S.KindRow>
        </Tooltip>

        <Tooltip title="Images count" mouseEnterDelay={TOOLTIP_DELAY}>
          <S.KindRow
            $type="resource"
            style={{width: '48.5%'}}
            onClick={() => {
              dispatch(setDashboardActiveAccordion('images'));
              trackEvent('dashboard/select_images');
            }}
          >
            <S.Count $small>
              <b>{imagesCount}</b> images
            </S.Count>
          </S.KindRow>
        </Tooltip>
      </S.InnerContainer>

      <S.InnerContainer>
        <Tooltip title={<ClusterDashboardErrorsWarningTooltip type="errors" />} mouseEnterDelay={TOOLTIP_DELAY}>
          <S.KindRow $type="error" style={{width: '48.5%'}} onClick={() => handleSetFilters('error')}>
            <S.Count $small>
              <b>{errorsCount}</b> errors
            </S.Count>
          </S.KindRow>
        </Tooltip>

        <Tooltip title={<ClusterDashboardErrorsWarningTooltip type="warnings" />} mouseEnterDelay={TOOLTIP_DELAY}>
          <S.KindRow $type="warning" style={{width: '48.5%'}} onClick={() => handleSetFilters('warning')}>
            <S.Count $small>
              <b>{warningsCount}</b> warnings
            </S.Count>
          </S.KindRow>
        </Tooltip>
      </S.InnerContainer>
    </S.Container>
  );
};
