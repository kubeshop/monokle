import {shell} from 'electron';

import {useCallback} from 'react';

import {ValidationIntegration} from '../integrations';
import * as S from './ValidationCard.styled';

type Props = {
  integration: ValidationIntegration;
  onDiscover: (id: string) => void;
};

export function ValidationCard({integration, onDiscover}: Props) {
  const {id, icon, name, description, learnMoreUrl} = integration;
  const openLearnMore = useCallback(() => shell.openExternal(learnMoreUrl), [learnMoreUrl]);

  return (
    <S.Card key={id}>
      <S.Icon name={icon} />
      <S.Name>{name}</S.Name>
      <p>
        <S.Description>{description}</S.Description> <S.Link onClick={openLearnMore}>Learn more</S.Link>
      </p>

      <S.Button onClick={() => onDiscover(id)}>Configure</S.Button>
    </S.Card>
  );
}
