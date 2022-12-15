import {useMemo} from 'react';
import {useMeasure} from 'react-use';

import {useAppSelector} from '@redux/hooks';

import ValidationOpenPolicyAgent from './ValidationOpenPolicyAgent';
import ValidationOverview from './ValidationOverview';
import * as S from './ValidationSettings.styled';

const ValidationSettings: React.FC = () => {
  const integration = useAppSelector(state => state.main.validationIntegration);

  const [validationSettingsRef, {height}] = useMeasure<HTMLDivElement>();

  const Panel = useMemo(() => {
    switch (integration?.id) {
      case 'open-policy-agent':
        return ValidationOpenPolicyAgent;
      default:
        return ValidationOverview;
    }
  }, [integration]);

  return (
    <S.ValidationSettingsContainer ref={validationSettingsRef}>
      <S.ValidationSettingsTitle>Configure your validation policies</S.ValidationSettingsTitle>

      <Panel height={height - 30} />
    </S.ValidationSettingsContainer>
  );
};

export default ValidationSettings;
