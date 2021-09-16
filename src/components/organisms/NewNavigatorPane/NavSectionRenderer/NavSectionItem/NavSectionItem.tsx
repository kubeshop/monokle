import React, {useCallback, useState} from 'react';
import {NavSectionItemHandler, NavSectionItemCustomization} from '@models/navsection';
import {useItemHandler} from './useItemHandler';
import {useItemCustomization} from './useItemCustomization';
import * as S from './styled';

function NavSectionItem<ItemType, ScopeType>(props: {
  item: ItemType;
  scope: ScopeType;
  handler: NavSectionItemHandler<ItemType, ScopeType>;
  level: number;
  isVisible: boolean;
  customization: NavSectionItemCustomization<ItemType> | undefined;
}) {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const {item, scope, handler, customization = {}, level, isVisible} = props;

  const {name, isSelected, isHighlighted, isDirty, isDisabled} = useItemHandler(item, scope, handler);
  const {Prefix, Suffix, QuickAction, customComponentProps} = useItemCustomization<ItemType>(item, customization, {
    isHovered,
  });

  const onClick = useCallback(() => {
    if (handler.onClick && !isDisabled) {
      handler.onClick(item, scope);
    }
  }, [handler]);

  return (
    <>
      {isVisible && (
        <S.ItemContainer
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          isSelected={isSelected}
          isHighlighted={isHighlighted}
          isVisible={isVisible}
          isHovered={isHovered}
          onClick={onClick}
        >
          <S.PrefixContainer>{Prefix && <Prefix {...customComponentProps} />}</S.PrefixContainer>
          <S.ItemName
            level={level}
            isSelected={isSelected}
            isDirty={isDirty}
            isHighlighted={isHighlighted}
            isDisabled={isDisabled}
          >
            {name}
            {isDirty && <span>*</span>}
          </S.ItemName>
          <S.SuffixContainer>{Suffix && <Suffix {...customComponentProps} />}</S.SuffixContainer>
          <S.QuickActionContainer>{QuickAction && <QuickAction {...customComponentProps} />}</S.QuickActionContainer>
        </S.ItemContainer>
      )}
    </>
  );
}

export default NavSectionItem;
