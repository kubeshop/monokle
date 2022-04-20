import * as S from './ValidationCardUpnext.styled';

const LET_US_KNOW_URL = 'https://github.com/kubeshop/monokle/issues/1550';

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
