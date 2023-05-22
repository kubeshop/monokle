import {useMemo} from 'react';
import {CheckCircleOutlined} from '@ant-design/icons';
import {useAppSelector} from '@redux/hooks';

import CRDsSchemaValidation from './CRDsSchemaValidation';
import ValidationOpenPolicyAgent from './ValidationOpenPolicyAgent';
import ValidationOverview from './ValidationOverview';
import * as S from './ValidationSettings.styled';

const ValidationSettings: React.FC = () => {
  const integration = useAppSelector(state => state.main.validationIntegration);

  const Panel = useMemo(() => {
    switch (integration?.id) {
      case 'open-policy-agent':
        return ValidationOpenPolicyAgent;
      case 'crd-schema':
        return CRDsSchemaValidation;
      default:
        return ValidationOverview;
    }
  }, [integration]);

  return (
    <S.ValidationSettingsContainer>
      <S.ValidationSettingsDescriptionAndButtonContainer>
        <S.ValidationSettingsDescription>
          Configure your validation policies below and <S.Link>check out changes in errors</S.Link>. Fully activate /
          deactivate sets of policies through the switcher on the top right. Set up further configuration through the
          &quot;Configure&quot; button where available.
        </S.ValidationSettingsDescription>
        <S.CheckoutErrorsButton type="primary">
          <CheckCircleOutlined />
          Checkout errors
        </S.CheckoutErrorsButton>
      </S.ValidationSettingsDescriptionAndButtonContainer>

      <Panel />
    </S.ValidationSettingsContainer>
  );
};

export default ValidationSettings;
