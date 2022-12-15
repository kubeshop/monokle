import {shell} from 'electron';

import {useCallback} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateValidationIntegration} from '@redux/reducers/main';
import {pluginEnabledSelector} from '@redux/validation/validation.selectors';
import {toggleValidation} from '@redux/validation/validation.slice';

import {ValidationIntegration} from '@shared/models/integrations';

import * as S from './ValidationCard.styled';

type Props = {
  integration: ValidationIntegration;
};

const ValidationCard: React.FC<Props> = ({integration}) => {
  const {id, icon, name, description, learnMoreUrl} = integration;

  const dispatch = useAppDispatch();
  const isEnabled = useAppSelector(state => pluginEnabledSelector(state, id));

  const openLearnMore = useCallback(() => shell.openExternal(learnMoreUrl), [learnMoreUrl]);

  const onConfigureHandler = () => {
    dispatch(updateValidationIntegration(integration));
  };

  const toggleEnabled = useCallback(() => {
    dispatch(toggleValidation(id));
  }, [dispatch, id]);

  return (
    <S.ValidationCardContainer key={id}>
      <S.Icon name={icon} key={icon} />

      <S.InfoContainer>
        <S.Name>{name}</S.Name>

        <span>
          <S.Description>{description}</S.Description>
          <S.Link onClick={openLearnMore}>Learn more</S.Link>
        </span>
      </S.InfoContainer>

      {integration.isConfigurable && (
        <S.ConfigureButton type="primary" onClick={onConfigureHandler}>
          Configure
        </S.ConfigureButton>
      )}

      <S.Switch checked={isEnabled} size="small" onChange={toggleEnabled} />
    </S.ValidationCardContainer>
  );
};

export default ValidationCard;
