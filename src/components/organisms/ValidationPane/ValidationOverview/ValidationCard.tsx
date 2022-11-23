import {shell} from 'electron';

import {useCallback} from 'react';

import {Switch} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateValidationIntegration} from '@redux/reducers/main';
import {pluginEnabledSelector} from '@redux/validation/validation.selectors';
import {toggleValidation} from '@redux/validation/validation.slice';

import {ValidationIntegration} from '@monokle-desktop/shared/models/integrations';
import {trackEvent} from '@monokle-desktop/shared/utils/telemetry';

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
    trackEvent('VALIDATION_PANE_OPENED', {id});
    dispatch(updateValidationIntegration(integration));
  };

  const toggleEnabled = useCallback(() => {
    dispatch(toggleValidation(id));
  }, [dispatch, id]);

  return (
    <S.Card key={id}>
      <S.ToggleContainer>
        <S.Icon name={icon} key={icon} />
        <Switch checked={isEnabled} size="small" onChange={toggleEnabled} />
      </S.ToggleContainer>

      <S.Name>{name}</S.Name>
      <span>
        <S.Description>{description}</S.Description>
        <S.Link onClick={openLearnMore}>Learn more</S.Link>
      </span>
      {integration.isConfigurable && <S.Button onClick={onConfigureHandler}>Configure</S.Button>}
    </S.Card>
  );
};

export default ValidationCard;
