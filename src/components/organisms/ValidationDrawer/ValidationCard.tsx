import {Card} from 'antd';

import {IconNames} from '@components/atoms/Icon';

import * as S from './ValidationCard.styled';

type Props = {
  id: string;
  icon: IconNames;
  name: string;
  description: string;
  learnMoreUrl: string;
};

export function ValidationCard({id, icon, name, description, learnMoreUrl}: Props) {
  return (
    <Card key={id} style={{backgroundColor: '#31393C', border: '2px solid #31393C', borderRadius: '2px'}}>
      <S.Icon name={icon} />
      <S.Name>{name}</S.Name>
      <p>
        <S.Description>{description}</S.Description> <S.Link href={learnMoreUrl}>Learn more</S.Link>
      </p>

      <S.Button>Configure</S.Button>
    </Card>
  );
}
