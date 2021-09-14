import React, {useState} from 'react';
import {NavSectionItemHandler, NavSectionItemCustomization} from '@models/navsection';
import {useDelayedUnmount} from '@hooks/useDelayedUnmount';
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

  const {shouldMount} = useDelayedUnmount(isVisible, 500);

  const {name, isSelected, isHighlighted} = useItemHandler(item, scope, handler);
  const {Prefix, Suffix, QuickAction, customComponentProps} = useItemCustomization<ItemType>(item, customization, {
    isHovered,
  });

  return (
    <>
      {shouldMount && (
        <S.ItemContainer
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          isSelected={isSelected}
          isHighlighted={isHighlighted}
          isVisible={isVisible}
          onClick={() => handler.onClick && handler.onClick(item, scope)}
        >
          <S.PrefixContainer>{Prefix && <Prefix {...customComponentProps} />}</S.PrefixContainer>
          <S.ItemName level={level} isSelected={isSelected} isHighlighted={isHighlighted}>
            {name}
          </S.ItemName>
          <S.SuffixContainer>{Suffix && <Suffix {...customComponentProps} />}</S.SuffixContainer>
          <S.QuickActionContainer>{QuickAction && <QuickAction {...customComponentProps} />}</S.QuickActionContainer>
        </S.ItemContainer>
      )}
    </>
  );
}

export default NavSectionItem;
