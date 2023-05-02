import {useMemo} from 'react';

import {Tooltip} from 'antd';

import {size} from 'lodash';

import {TOOLTIP_DELAY} from '@constants/constants';
import {ClusterDashboardErrorsWarningTooltip} from '@constants/tooltips';

import {useAppDispatch} from '@redux/hooks';
import {setLeftMenuSelection} from '@redux/reducers/ui';
import {useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';
import {problemsSelector, useValidationSelector} from '@redux/validation/validation.selectors';
import {setValidationFilters} from '@redux/validation/validation.slice';

import {useRefSelector} from '@utils/hooks';

import * as S from './Status.styled';

export const Status = () => {
  const dispatch = useAppDispatch();

  const currentFilters = useRefSelector(state => state.validation.validationOverview.filters);
  const problems = useValidationSelector(problemsSelector);

  const clusterResourceCount = size(useResourceMetaMap('cluster'));

  const errorsCount = useMemo(() => size(problems.filter(p => p.level === 'error')), [problems]);
  const warningsCount = useMemo(() => size(problems.filter(p => p.level === 'warning')), [problems]);

  const handleSetFilters = (type: 'warning' | 'error') => {
    dispatch(setValidationFilters({...currentFilters.current, type}));
    dispatch(setLeftMenuSelection('validation'));
  };

  return (
    <S.Container>
      <S.KindRow $type="resource">
        <S.Count>{clusterResourceCount}</S.Count>
        <span>resources</span>
      </S.KindRow>

      <S.InnerContainer>
        <Tooltip title={<ClusterDashboardErrorsWarningTooltip type="errors" />} mouseEnterDelay={TOOLTIP_DELAY}>
          <S.KindRow $type="error" style={{width: '48.5%'}} onClick={() => handleSetFilters('error')}>
            <S.Count>{errorsCount}</S.Count>
            <span>errors</span>
          </S.KindRow>
        </Tooltip>

        <Tooltip title={<ClusterDashboardErrorsWarningTooltip type="warnings" />} mouseEnterDelay={TOOLTIP_DELAY}>
          <S.KindRow $type="warning" style={{width: '48.5%'}} onClick={() => handleSetFilters('warning')}>
            <S.Count>{warningsCount}</S.Count>
            <span>warnings</span>
          </S.KindRow>
        </Tooltip>
      </S.InnerContainer>
    </S.Container>
  );
};
