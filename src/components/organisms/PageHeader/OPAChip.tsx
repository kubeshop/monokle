import {useAppSelector} from '@redux/hooks';

import {Icon} from '@monokle/components';

import * as S from './OPAChip.styled';

export const OPAChip = () => {
  const opaRulesCount = useAppSelector(state => state.validation.config.rules?.length || 0);
  return (
    <S.Container>
      <Icon name="opa-status" />
      <S.BlueText>{opaRulesCount}</S.BlueText>
    </S.Container>
  );
};
