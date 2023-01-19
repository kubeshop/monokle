import {useAppSelector} from '@redux/hooks';

import {OPAStatus} from '@components/atoms/Icon/Icons';

import * as S from './OPAChip.styled';

export const OPAChip = () => {
  const opaRulesCount = useAppSelector(state => state.validation.config.rules?.length || 0);
  return (
    <S.Container>
      <OPAStatus />
      <S.BlueText>{opaRulesCount}</S.BlueText>
    </S.Container>
  );
};
