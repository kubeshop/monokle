import {useMemo} from 'react';

import {Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateValidationIntegration} from '@redux/reducers/main';
import {setLeftMenuSelection, toggleLeftMenu} from '@redux/reducers/ui';

import {Icon} from '@atoms';

import {OPA_INTEGRATION} from '@shared/models/integrations';

import * as S from './OPAValidationStatus.styled';

const OPAValidationStatus: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeRulesCount = useAppSelector(state => {
    const plugins = state.main.policies.plugins;
    let numberOfActiveRules = 0;

    plugins.forEach(plugin => {
      numberOfActiveRules += plugin.config.enabledRules.length;
    });

    return numberOfActiveRules;
  });
  const isLeftMenuActive = useAppSelector(state => state.ui.leftMenu.isActive);

  const tooltipTitle = useMemo(() => {
    if (!activeRulesCount) {
      return 'OPA validation is inactive. Click to activate.';
    }

    return `${activeRulesCount} OPA rules active. Click to manage.`;
  }, [activeRulesCount]);

  const onClickHandler = () => {
    dispatch(updateValidationIntegration(OPA_INTEGRATION));

    if (!isLeftMenuActive) {
      dispatch(toggleLeftMenu());
    }

    dispatch(setLeftMenuSelection('validation-pane'));
  };

  return (
    <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={tooltipTitle}>
      <S.Container onClick={onClickHandler} $status={activeRulesCount ? 'active' : 'inactive'}>
        <Icon name="opa-status" />
        {activeRulesCount || '-'}
      </S.Container>
    </Tooltip>
  );
};

export default OPAValidationStatus;
