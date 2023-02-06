import {opaRuleCountSelector, useValidationSelector} from '@redux/validation/validation.selectors';

import {Icon} from '@monokle/components';

import * as S from './OPAChip.styled';

export const OPAChip = () => {
  const opaRulesCount = useValidationSelector(opaRuleCountSelector);

  return (
    <S.Container>
      <Icon name="opa-status" />
      <S.BlueText>{opaRulesCount}</S.BlueText>
    </S.Container>
  );
};
