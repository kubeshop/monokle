import React, {useCallback, useState, useRef, useEffect, useContext} from 'react';
import ScrollIntoView, {ScrollContainerRef} from '@components/molecules/ScrollIntoView';
import AppContext from '@src/AppContext';
import {NAVIGATOR_HEIGHT_OFFSET} from '@constants/constants';
import {ItemBlueprint} from '@models/navigator';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectInstance} from '@redux/reducers/navigator';
import {useItemCustomization} from './useItemCustomization';
import * as S from './styled';

function NavSectionItem<ItemType, ScopeType>(props: {
  itemId: string;
  blueprint: ItemBlueprint<ItemType, ScopeType>;
  level: number;
  isLastItem: boolean;
}) {
  const {windowSize} = useContext(AppContext);
  const windowHeight = windowSize.height;
  const navigatorHeight = windowHeight - NAVIGATOR_HEIGHT_OFFSET;
  const {itemId, blueprint, level, isLastItem} = props;
  const dispatch = useAppDispatch();

  const [isHovered, setIsHovered] = useState<boolean>(false);

  const itemInstance = useAppSelector(state => state.navigator.itemInstanceMap[itemId]);
  const selectedInstanceId = useAppSelector(state => state.navigator.selectedInstanceId);
  const {instanceHandler} = blueprint;

  const {Prefix, Suffix, QuickAction, ContextMenu} = useItemCustomization(blueprint.customization);

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
    if (!itemInstance.shouldScrollIntoView) {
      return;
    }
    if (isScrolledIntoView()) {
      return;
    }
    scrollContainer.current?.scrollIntoView();
  }, [itemInstance.shouldScrollIntoView, isScrolledIntoView]);

  const onClick = useCallback(() => {
    if (instanceHandler && instanceHandler.onClick && !itemInstance.isDisabled) {
      instanceHandler.onClick(itemInstance, dispatch);
    }
  }, [instanceHandler, itemInstance, dispatch]);

  useEffect(() => {
    if (selectedInstanceId && itemId === selectedInstanceId) {
      onClick();
      selectInstance(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInstanceId]);

  return (
    <ScrollIntoView ref={scrollContainer}>
      <S.ItemContainer
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        isSelected={itemInstance.isSelected}
        isHighlighted={itemInstance.isHighlighted}
        isHovered={isHovered}
        level={level}
        isLastItem={isLastItem}
      >
        <S.PrefixContainer>
          {Prefix.Component && (Prefix.options?.isVisibleOnHover ? isHovered : true) && (
            <Prefix.Component itemInstance={itemInstance} options={Prefix.options} />
          )}
        </S.PrefixContainer>
        <S.ItemName
          level={level}
          isSelected={itemInstance.isSelected}
          isDirty={itemInstance.isDirty}
          isHighlighted={itemInstance.isHighlighted}
          isDisabled={itemInstance.isDisabled}
          onClick={onClick}
        >
          {itemInstance.name}
          {itemInstance.isDirty && <span>*</span>}
        </S.ItemName>
        {Suffix.Component && (Suffix.options?.isVisibleOnHover ? isHovered : true) && (
          <S.SuffixContainer>
            <Suffix.Component itemInstance={itemInstance} options={Suffix.options} />
          </S.SuffixContainer>
        )}
        {QuickAction.Component && (QuickAction.options?.isVisibleOnHover ? isHovered : true) && (
          <S.QuickActionContainer>
            <QuickAction.Component itemInstance={itemInstance} options={QuickAction.options} />
          </S.QuickActionContainer>
        )}
        {ContextMenu.Component && (ContextMenu.options?.isVisibleOnHover ? isHovered : true) && (
          <S.ContextMenuContainer>
            <ContextMenu.Component itemInstance={itemInstance} options={QuickAction.options} />
          </S.ContextMenuContainer>
        )}
      </S.ItemContainer>
    </ScrollIntoView>
  );
}

export default NavSectionItem;
