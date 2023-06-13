import {useMemo} from 'react';

import {CheckCircleOutlined} from '@ant-design/icons';

import {useAppDispatch} from '@redux/hooks';
import {setLeftMenuSelection} from '@redux/reducers/ui';
import {pluginMetadataSelector, useValidationSelector} from '@redux/validation/validation.selectors';

import CRDsSchemaValidation from './CRDsSchemaValidation/CRDsSchemaValidation';
import ValidationCustom from './ValidationCustom';
import ValidationOverview from './ValidationOverview';
import {VALIDATION_CONFIGURATION_COMPONENTS} from './ValidationOverview/ConfigurationComponents';
import * as S from './ValidationSettings.styled';

const ValidationSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const plugin = useValidationSelector(state => state.configure.plugin);
  const pluginMetadata = useValidationSelector(s => pluginMetadataSelector(s, plugin?.name));
  const status = useValidationSelector(s => s.status);

  const handleValidation = () => {
    dispatch(setLeftMenuSelection('validation'));
  };

  const ConfigPane = useMemo(() => {
    return plugin?.name ? VALIDATION_CONFIGURATION_COMPONENTS[plugin.name] ?? ValidationCustom : undefined;
  }, [plugin]);

  if (status === 'error') {
    return <div>Failed to load plugins.</div>;
  }

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

      {plugin?.id === 'crd-schema' ? (
        <CRDsSchemaValidation />
      ) : pluginMetadata && ConfigPane ? (
        <ConfigPane {...pluginMetadata} />
      ) : (
        <ValidationOverview />
      )}
    </S.ValidationSettingsContainer>
  );
};

export default ValidationSettings;
