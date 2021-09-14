import React from 'react';
import {NavSectionItemHandler} from '@models/navsection';
import {useDelayedUnmount} from '@hooks/useDelayedUnmount';
import {useNavSectionItem} from './useNavSectionItem';
import * as S from './styled';

function NavSectionItem<ItemType, ScopeType>(props: {
  item: ItemType;
  scope: ScopeType;
  handler: NavSectionItemHandler<ItemType, ScopeType>;
  level: number;
  isVisible: boolean;
}) {
  const {item, scope, handler, level, isVisible} = props;
  const {name, isSelected, isHighlighted} = useNavSectionItem(item, scope, handler);

  const {shouldMount} = useDelayedUnmount(isVisible, 500);

  return (
    <>
      {shouldMount && (
        <S.ItemContainer
          isSelected={isSelected}
          isHighlighted={isHighlighted}
          isVisible={isVisible}
          onClick={() => handler.onClick && handler.onClick(item, scope)}
        >
          <S.ItemName level={level} isSelected={isSelected} isHighlighted={isHighlighted}>
            {name}
          </S.ItemName>
        </S.ItemContainer>
      )}
    </>
  );
}

export default NavSectionItem;
