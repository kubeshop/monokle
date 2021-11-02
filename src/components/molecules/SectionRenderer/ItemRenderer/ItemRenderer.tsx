import React, {useCallback, useState, useRef, useEffect, useContext} from 'react';
import ScrollIntoView, {ScrollContainerRef} from '@components/molecules/ScrollIntoView';
import AppContext from '@src/AppContext';
import {NAVIGATOR_HEIGHT_OFFSET} from '@constants/constants';
import {ItemBlueprint} from '@models/navigator';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {useItemCustomization} from './useItemCustomization';
import * as S from './styled';

export type ItemRendererOptions = {
  disablePrefix?: boolean;
  disableSuffix?: boolean;
  disableQuickAction?: boolean;
  disableContextMenu?: boolean;
};

export type ItemRendererProps<ItemType, ScopeType> = {
  itemId: string;
  blueprint: ItemBlueprint<ItemType, ScopeType>;
  level: number;
  isLastItem: boolean;
  options?: ItemRendererOptions;
};

function ItemRenderer<ItemType, ScopeType>(props: ItemRendererProps<ItemType, ScopeType>) {
  const {windowSize} = useContext(AppContext);
  const windowHeight = windowSize.height;
  const navigatorHeight = windowHeight - NAVIGATOR_HEIGHT_OFFSET;
  const {itemId, blueprint, level, isLastItem, options} = props;
  const dispatch = useAppDispatch();

  const [isHovered, setIsHovered] = useState<boolean>(false);

  const itemInstance = useAppSelector(state => state.navigator.itemInstanceMap[itemId]);
  const selectedInstanceId = useAppSelector(state => state.navigator.selectedInstanceId);
  const {instanceHandler} = blueprint;

  const {Prefix, Suffix, QuickAction, ContextMenu, NameDisplay} = useItemCustomization(blueprint.customization);

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
        hasOnClick={Boolean(instanceHandler?.onClick)}
      >
        <S.PrefixContainer>
          {Prefix.Component && !options?.disablePrefix && (Prefix.options?.isVisibleOnHover ? isHovered : true) && (
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
          {NameDisplay.Component ? (
            <NameDisplay.Component itemInstance={itemInstance} />
          ) : (
            <>
              {itemInstance.name}
              {itemInstance.isDirty && <span>*</span>}
            </>
          )}
        </S.ItemName>
        {Suffix.Component && !options?.disableSuffix && (Suffix.options?.isVisibleOnHover ? isHovered : true) && (
          <S.SuffixContainer>
            <Suffix.Component itemInstance={itemInstance} options={Suffix.options} />
          </S.SuffixContainer>
        )}
        {QuickAction.Component &&
          !options?.disableQuickAction &&
          (QuickAction.options?.isVisibleOnHover ? isHovered : true) && (
            <S.QuickActionContainer>
              <QuickAction.Component itemInstance={itemInstance} options={QuickAction.options} />
            </S.QuickActionContainer>
          )}
        {ContextMenu.Component &&
          !options?.disableContextMenu &&
          (ContextMenu.options?.isVisibleOnHover ? isHovered : true) && (
            <S.ContextMenuContainer>
              <ContextMenu.Component itemInstance={itemInstance} options={QuickAction.options} />
            </S.ContextMenuContainer>
          )}
      </S.ItemContainer>
    </ScrollIntoView>
  );
}

export default ItemRenderer;
