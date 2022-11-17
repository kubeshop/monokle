import {TitleBar} from '@monokle/components';

import * as S from './Header.styled';

export const Header = ({title}: {title: string}) => {
  return (
    <S.Container>
      <TitleBar type="secondary" title={title} actions={<span>Selection</span>} />
    </S.Container>
  );
};
