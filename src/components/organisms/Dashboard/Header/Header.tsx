import {TitleBar} from '@monokle/components';

import * as S from './Header.styled';

export const Header = () => {
  return (
    <S.Container>
      <TitleBar type="secondary" title="Overview" actions={<span>Selection</span>} />
    </S.Container>
  );
};
