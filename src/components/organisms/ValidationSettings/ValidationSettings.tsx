import {useMemo} from 'react';

import {CheckCircleOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
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
          Configure your validation policies below and see results in the
          <S.Link onClick={handleValidation}>Validation Overview</S.Link>. Enable/disable entire policies with the
          toggle on the top right of each section below. Configure individual rules and settings with the
          &quot;Configure&quot; button where available.
        </S.ValidationSettingsDescription>
        <S.CheckoutErrorsButton type="primary" onClick={handleValidation}>
          <CheckCircleOutlined />
          See Validation Results
        </S.CheckoutErrorsButton>
      </S.ValidationSettingsDescriptionAndButtonContainer>

      <Panel />
    </S.ValidationSettingsContainer>
  );
};

export default ValidationSettings;
