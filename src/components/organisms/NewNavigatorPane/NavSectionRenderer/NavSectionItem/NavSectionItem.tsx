import React, {useCallback, useState, useRef, useEffect, useContext} from 'react';
import {NavSectionItemHandler, NavSectionItemCustomization} from '@models/navsection';
import ScrollIntoView, {ScrollContainerRef} from '@components/molecules/ScrollIntoView';
import AppContext from '@src/AppContext';
import {NAVIGATOR_HEIGHT_OFFSET} from '@constants/constants';
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
  const {windowSize} = useContext(AppContext);
  const windowHeight = windowSize.height;
  const navigatorHeight = windowHeight - NAVIGATOR_HEIGHT_OFFSET;

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const {item, scope, handler, customization = {}, level, isVisible} = props;

  const {name, isSelected, isHighlighted, isDirty, isDisabled, shouldScrollIntoView} = useItemHandler(
    item,
    scope,
    handler
  );
  const {Prefix, Suffix, QuickAction, customComponentProps} = useItemCustomization<ItemType>(item, customization, {
    isHovered,
    isSelected,
  });

  const scrollContainer = useRef<ScrollContainerRef>(null);
  const isScrolledIntoView = useCallback(() => {
    const boundingClientRect = scrollContainer.current?.getBoundingClientRect();
    if (!boundingClientRect) {
      return false;
    }
    const elementTop = boundingClientRect.top;
    const elementBottom = boundingClientRect.bottom;
    return elementTop < navigatorHeight && elementBottom >= 0;
  }, [navigatorHeight]);

  useEffect(() => {
    if (!shouldScrollIntoView) {
      return;
    }
    if (isScrolledIntoView()) {
      return;
    }
    scrollContainer.current?.scrollIntoView();
  }, [shouldScrollIntoView]);

  const onClick = useCallback(() => {
    if (handler.onClick && !isDisabled) {
      handler.onClick(item, scope);
    }
  }, [handler]);

  return (
    <ScrollIntoView ref={scrollContainer}>
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
    </ScrollIntoView>
  );
}

export default NavSectionItem;
