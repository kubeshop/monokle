import {IconNames} from '@components/atoms/Icon';

import * as S from './ValidationCard.styled';

type Props = {
  id: string;
  icon: IconNames;
  name: string;
  description: string;
  learnMoreUrl: string;
  onDiscover: (id: string) => void;
};

export function ValidationCard({id, icon, name, description, learnMoreUrl, onDiscover}: Props) {
  return (
    <S.Card key={id}>
      <S.Icon name={icon} />
      <S.Name>{name}</S.Name>
      <p>
        <S.Description>{description}</S.Description> <S.Link href={learnMoreUrl}>Learn more</S.Link>
      </p>

      <S.Button onClick={() => onDiscover(id)}>Configure</S.Button>
    </S.Card>
  );
}
