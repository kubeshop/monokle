import {useMemo} from 'react';

import {Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useAppSelector} from '@redux/hooks';

import {Icon} from '@components/atoms';

import * as S from './OPAValidationStatus.styled';

const OPAValidationStatus: React.FC = () => {
  const activeRulesCount = useAppSelector(state => {
    const plugins = state.main.policies.plugins;
    let numberOfActiveRules = 0;

    plugins.forEach(plugin => {
      numberOfActiveRules += plugin.config.enabledRules.length;
    });

    return numberOfActiveRules;
  });

  const tooltipTitle = useMemo(() => {
    if (!activeRulesCount) {
      return 'OPA validation is inactive. Click to activate.';
    }

    return `${activeRulesCount} OPA rules active. Click to manage.`;
  }, [activeRulesCount]);

  return (
    <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={tooltipTitle}>
      <S.Container $status={activeRulesCount ? 'active' : 'inactive'}>
        <Icon name="opa-status" />
        {activeRulesCount || '-'}
      </S.Container>
    </Tooltip>
  );
};

export default OPAValidationStatus;
