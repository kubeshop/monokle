import React, {useMemo} from 'react';
import {NavSectionItemHandlers} from '@models/navsection';
import * as S from './styled';

function NavSectionItem<ItemType, ScopeType>(props: {
  item: ItemType;
  scope: ScopeType;
  handlers: NavSectionItemHandlers<ItemType, ScopeType>;
  level: number;
}) {
  const {item, scope, handlers, level} = props;

  const name = useMemo(() => {
    return handlers.getName(item, scope);
  }, [handlers.getName, scope]);

  const isSelected = useMemo(() => {
    return Boolean(handlers.isSelected && handlers.isSelected(item, scope));
  }, [handlers.isSelected, scope]);

  const isHighlighted = useMemo(() => {
    return Boolean(handlers.isHighlighted && handlers.isHighlighted(item, scope));
  }, [handlers.isHighlighted, scope]);

  return (
    <S.ItemContainer
      isSelected={isSelected}
      isHighlighted={isHighlighted}
      onClick={() => handlers.onClick && handlers.onClick(item, scope)}
    >
      <S.ItemName level={level} isSelected={isSelected} isHighlighted={isHighlighted}>
        {name}
      </S.ItemName>
    </S.ItemContainer>
  );
}

export default NavSectionItem;
