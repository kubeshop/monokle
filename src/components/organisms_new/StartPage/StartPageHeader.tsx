import {SearchInput} from '@atoms';

import MonokleKubeshopLogo from '@assets/NewMonokleLogoDark.svg';

import * as S from './StatePageHeader.styled';

const StartPageHeader: React.FC = () => {
  return (
    <S.StartPageHeaderContainer>
      <S.LogoContainer>
        <S.Logo id="monokle-logo-header" src={MonokleKubeshopLogo} alt="Monokle" />
      </S.LogoContainer>

      <SearchInput style={{width: '340px'}} />
    </S.StartPageHeaderContainer>
  );
};

export default StartPageHeader;
