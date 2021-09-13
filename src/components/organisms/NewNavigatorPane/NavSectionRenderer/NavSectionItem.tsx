import React, {useMemo} from 'react';
import {NavSectionItemHandler} from '@models/navsection';
import * as S from './styled';

function NavSectionItem<ItemType, ScopeType>(props: {
  item: ItemType;
  scope: ScopeType;
  handler: NavSectionItemHandler<ItemType, ScopeType>;
  level: number;
}) {
  const {item, scope, handler, level} = props;

  const name = useMemo(() => {
    return handler.getName(item, scope);
  }, [handler, scope, item]);

  const isSelected = useMemo(() => {
    return Boolean(handler.isSelected && handler.isSelected(item, scope));
  }, [handler, scope, item]);

  const isHighlighted = useMemo(() => {
    return Boolean(handler.isHighlighted && handler.isHighlighted(item, scope));
  }, [handler, scope, item]);

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
