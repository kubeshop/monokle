import {useMemo} from 'react';

import {useAppSelector} from '@redux/hooks';

import ValidationOverview from './ValidationOverview';
import * as S from './ValidationSettings.styled';

const ValidationSettings: React.FC = () => {
  const integration = useAppSelector(state => state.main.validationIntegration);

  const Panel = useMemo(() => {
    switch (integration?.id) {
      default:
        return ValidationOverview;
    }
  }, [integration]);

  return (
    <S.ValidationSettingsContainer>
      <S.ValidationSettingsTitle>Configure your validation policies</S.ValidationSettingsTitle>

      <Panel />
    </S.ValidationSettingsContainer>
  );
};

export default ValidationSettings;
