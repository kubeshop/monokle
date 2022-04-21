import {LET_US_KNOW_URL} from '@constants/constants';

import * as S from './ValidationCardUpnext.styled';

export function ValidationCardUpnext() {
  return (
    <S.Card>
      <S.Icon />
      <S.Name>New tools coming up soon!</S.Name>
      <span>
        <S.Link href={LET_US_KNOW_URL}>Let us know your favorites</S.Link>
      </span>
    </S.Card>
  );
}
