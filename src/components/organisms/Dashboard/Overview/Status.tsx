import {Tooltip} from 'antd';

import {size} from 'lodash';

import {TOOLTIP_DELAY} from '@constants/constants';
import {ClusterDashboardErrorsWarningTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLeftMenuSelection} from '@redux/reducers/ui';
import {errorsSelector, useValidationSelector, warningsSelector} from '@redux/validation/validation.selectors';

import * as S from './Status.styled';

export const Status = () => {
  const dispatch = useAppDispatch();
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
        <Tooltip title={<ClusterDashboardErrorsWarningTooltip type="errors" />} mouseEnterDelay={TOOLTIP_DELAY}>
          <S.KindRow
            $type="error"
            style={{width: '48.5%'}}
            onClick={() => dispatch(setLeftMenuSelection('validation'))}
          >
            <S.Count>{size(errors)}</S.Count>
            <span>errors</span>
          </S.KindRow>
        </Tooltip>

        <Tooltip title={<ClusterDashboardErrorsWarningTooltip type="warnings" />} mouseEnterDelay={TOOLTIP_DELAY}>
          <S.KindRow
            $type="warning"
            style={{width: '48.5%'}}
            onClick={() => dispatch(setLeftMenuSelection('validation'))}
          >
            <S.Count>{size(warnings)}</S.Count>
            <span>warnings</span>
          </S.KindRow>
        </Tooltip>
      </S.InnerContainer>
    </S.Container>
  );
};
