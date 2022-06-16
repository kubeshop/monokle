import {shell} from 'electron';

import {useCallback} from 'react';

import {ValidationIntegration} from '@models/integrations';

import {useAppDispatch} from '@redux/hooks';
import {updateValidationIntegration} from '@redux/reducers/ui';

import {trackEvent} from '@utils/telemetry';

import * as S from './ValidationCard.styled';

type Props = {
  integration: ValidationIntegration;
};

export const ValidationCard: React.FC<Props> = ({integration}) => {
  const {id, icon, name, description, learnMoreUrl} = integration;

  const dispatch = useAppDispatch();

  const openLearnMore = useCallback(() => shell.openExternal(learnMoreUrl), [learnMoreUrl]);

  const onConfigureHandler = () => {
    trackEvent('VALIDATION_PANE_OPENED', {id});
    dispatch(updateValidationIntegration(integration));
  };

  return (
    <S.Card key={id}>
      <S.Icon name={icon} />
      <S.Name>{name}</S.Name>
      <p>
        <S.Description>{description}</S.Description> <S.Link onClick={openLearnMore}>Learn more</S.Link>
      </p>

      <S.Button onClick={onConfigureHandler}>Configure</S.Button>
    </S.Card>
  );
};
