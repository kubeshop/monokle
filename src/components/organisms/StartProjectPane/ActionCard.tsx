import React from 'react';

import * as S from './ActionCard.styled';

type IProps = {
  logo: string;
  size?: 'big' | 'small';
  title: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  multipleActions?: React.ReactNode;
  onClick?: () => void;
};

const ActionCard: React.FC<IProps> = props => {
  const {description, disabled, id, logo, multipleActions, size = 'small', title, onClick} = props;

  return (
    <S.ActionCard id={id} $disabled={disabled} $hasMultipleActions={Boolean(multipleActions)} onClick={onClick}>
      <S.ActionItemLogo src={logo} />

      <S.ActionItemTitle $size={size}>{title}</S.ActionItemTitle>

      {description && <S.ActionItemDescription>{description}</S.ActionItemDescription>}

      {multipleActions && <S.MultipleActions>{multipleActions}</S.MultipleActions>}
    </S.ActionCard>
  );
};

export default ActionCard;
