import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';

import {NAVIGATOR_HEIGHT_OFFSET} from '@constants/constants';

import {ItemBlueprint} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';

import ScrollIntoView, {ScrollContainerRef} from '@components/molecules/ScrollIntoView';

import AppContext from '@src/AppContext';

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
  const {instanceHandler} = blueprint;

  const {Prefix, Suffix, QuickAction, ContextMenu, NameDisplay} = useItemCustomization(blueprint.customization);

  const scrollContainer = useRef<ScrollContainerRef>(null);

  useEffect(() => {
    if (!itemInstance.shouldScrollIntoView) {
      return;
    }
    scrollContainer.current?.scrollIntoView();
  }, [itemInstance.shouldScrollIntoView]);

  const onClick = useCallback(() => {
    if (instanceHandler && instanceHandler.onClick && !itemInstance.isDisabled) {
      instanceHandler.onClick(itemInstance, dispatch);
    }
  }, [instanceHandler, itemInstance, dispatch]);

  return (
    <ScrollIntoView id={itemInstance.id} ref={scrollContainer}>
      <S.ItemContainer
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        isSelected={itemInstance.isSelected}
        isHighlighted={itemInstance.isHighlighted}
        disableHoverStyle={Boolean(blueprint.customization?.disableHoverStyle)}
        isHovered={isHovered}
        level={level}
        isLastItem={isLastItem}
        hasOnClick={Boolean(instanceHandler?.onClick)}
      >
        {Prefix.Component && !options?.disablePrefix && (Prefix.options?.isVisibleOnHover ? isHovered : true) && (
          <S.PrefixContainer>
            <Prefix.Component itemInstance={itemInstance} options={Prefix.options} />
          </S.PrefixContainer>
        )}

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

        <S.BlankSpace onClick={onClick} />

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
