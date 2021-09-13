import React from 'react';
import {NavSectionItemHandler} from '@models/navsection';
import {useNavSectionItem} from './useNavSectionItem';
import * as S from './styled';

function NavSectionItem<ItemType, ScopeType>(props: {
  item: ItemType;
  scope: ScopeType;
  handler: NavSectionItemHandler<ItemType, ScopeType>;
  level: number;
}) {
  const {item, scope, handler, level} = props;
  const {name, isSelected, isHighlighted} = useNavSectionItem(item, scope, handler);

  return (
    <S.ItemContainer
      isSelected={isSelected}
      isHighlighted={isHighlighted}
      onClick={() => handler.onClick && handler.onClick(item, scope)}
    >
      <S.ItemName level={level} isSelected={isSelected} isHighlighted={isHighlighted}>
        {name}
      </S.ItemName>
    </S.ItemContainer>
  );
}

export default NavSectionItem;
