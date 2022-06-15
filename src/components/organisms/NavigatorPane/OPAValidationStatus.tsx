import {useAppSelector} from '@redux/hooks';

import {Icon} from '@components/atoms';

import * as S from './OPAValidationStatus.styled';

const OPAValidationStatus: React.FC = () => {
  const activeRules = useAppSelector(state => {
    const plugins = state.main.policies.plugins;
    let numberOfActiveRules = 0;

    plugins.forEach(plugin => {
      numberOfActiveRules += plugin.config.enabledRules.length;
    });

    return numberOfActiveRules;
  });

  return (
    <S.Container $status={activeRules ? 'active' : 'inactive'}>
      <Icon name="opa-status" />
      {activeRules || '-'}
    </S.Container>
  );
};

export default OPAValidationStatus;
