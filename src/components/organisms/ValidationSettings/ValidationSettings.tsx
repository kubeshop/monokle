import {useMemo} from 'react';

import {CheckCircleOutlined} from '@ant-design/icons';

import {useAppDispatch} from '@redux/hooks';
import {setLeftMenuSelection} from '@redux/reducers/ui';
import {useValidationSelector} from '@redux/validation/validation.selectors';

import CRDsSchemaValidation from './CRDsSchemaValidation';
import ValidationOpenPolicyAgent from './ValidationOpenPolicyAgent';
import ValidationOverview from './ValidationOverview';
import * as S from './ValidationSettings.styled';

const ValidationSettings: React.FC = () => {
  const plugin = useValidationSelector(state => state.configure.plugin);

  const dispatch = useAppDispatch();

  const handleValidation = () => {
    dispatch(setLeftMenuSelection('validation'));
  };

  const Panel = useMemo(() => {
    switch (plugin?.id) {
      case 'open-policy-agent':
        return ValidationOpenPolicyAgent;
      case 'crd-schema':
        return CRDsSchemaValidation;
      default:
        return ValidationOverview;
    }
  }, [plugin]);

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
