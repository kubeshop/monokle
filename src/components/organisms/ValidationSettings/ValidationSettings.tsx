import {useMemo} from 'react';
import {CheckCircleOutlined} from '@ant-design/icons';
import {useAppSelector, useAppDispatch} from '@redux/hooks';
import {setLeftMenuSelection} from '@redux/reducers/ui';

import CRDsSchemaValidation from './CRDsSchemaValidation';
import ValidationOpenPolicyAgent from './ValidationOpenPolicyAgent';
import ValidationOverview from './ValidationOverview';
import * as S from './ValidationSettings.styled';

const ValidationSettings: React.FC = () => {
  const integration = useAppSelector(state => state.main.validationIntegration);

  const dispatch = useAppDispatch();

  const handleValidation = () => {
    dispatch(setLeftMenuSelection('validation'));
  };

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
          Configure your validation policies below and{' '}
          <S.Link onClick={handleValidation}>check out changes in errors</S.Link>. Fully activate / deactivate sets of
          policies through the switcher on the top right. Set up further configuration through the &quot;Configure&quot;
          button where available.
        </S.ValidationSettingsDescription>
        <S.CheckoutErrorsButton type="primary" onClick={handleValidation}>
          <CheckCircleOutlined />
          Checkout errors
        </S.CheckoutErrorsButton>
      </S.ValidationSettingsDescriptionAndButtonContainer>

      <Panel />
    </S.ValidationSettingsContainer>
  );
};

export default ValidationSettings;
