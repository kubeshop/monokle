import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {ItemBlueprint} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';

import ScrollIntoView, {ScrollContainerRef} from '@components/molecules/ScrollIntoView';

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
  isSectionCheckable: boolean;
  sectionContainerElementId: string;
  indentation: number;
  options?: ItemRendererOptions;
};

function ItemRenderer<ItemType, ScopeType>(props: ItemRendererProps<ItemType, ScopeType>) {
  const {itemId, blueprint, level, isLastItem, isSectionCheckable, sectionContainerElementId, indentation, options} =
    props;
  const {instanceHandler} = blueprint;

  const dispatch = useAppDispatch();
  const checkedResourceIds = useAppSelector(state => state.main.checkedResourceIds);
  const itemInstance = useAppSelector(state => state.navigator.itemInstanceMap[itemId]);

  const [isHovered, setIsHovered] = useState<boolean>(false);

  const {Prefix, Suffix, QuickAction, ContextMenu, ContextMenuWrapper, NameDisplay} = useItemCustomization(
    blueprint.customization
  );

  const previouslyCheckedResourcesLength = useRef(checkedResourceIds.length);
  const scrollContainer = useRef<ScrollContainerRef>(null);

  const onClick = useCallback(() => {
    if (instanceHandler && instanceHandler.onClick && !itemInstance.isDisabled) {
      instanceHandler.onClick(itemInstance, dispatch);
    }
  }, [instanceHandler, itemInstance, dispatch]);

  const onCheck = useCallback(() => {
    if (instanceHandler && instanceHandler.onCheck && !itemInstance.isDisabled) {
      instanceHandler.onCheck(itemInstance, dispatch);
    }
  }, [instanceHandler, itemInstance, dispatch]);

  useEffect(() => {
    if (!itemInstance.shouldScrollIntoView) {
      return;
    }

    // checking/unchecking a resource should not scroll
    if (checkedResourceIds.length !== previouslyCheckedResourcesLength.current) {
      previouslyCheckedResourcesLength.current = checkedResourceIds.length;
      return;
    }

    scrollContainer.current?.scrollIntoView();
  }, [checkedResourceIds.length, itemInstance.shouldScrollIntoView]);

  const Wrapper = useMemo(
    () => (ContextMenuWrapper.Component ? ContextMenuWrapper.Component : 'div'),
    [ContextMenuWrapper.Component]
  );

  return (
    <ScrollIntoView id={itemInstance.id} ref={scrollContainer} parentContainerElementId={sectionContainerElementId}>
      {Wrapper && (
        <Wrapper itemInstance={itemInstance} options={ContextMenuWrapper.options}>
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
            $indentation={indentation}
            $isSectionCheckable={isSectionCheckable}
            $hasCustomNameDisplay={Boolean(NameDisplay.Component)}
            $lastItemMarginBottom={blueprint.customization?.lastItemMarginBottom}
          >
            {itemInstance.isCheckable &&
              (blueprint.customization?.isCheckVisibleOnHover ? itemInstance.isChecked || isHovered : true) && (
                <span>
                  <S.Checkbox
                    checked={itemInstance.isChecked}
                    disabled={itemInstance.isDisabled}
                    onChange={() => onCheck()}
                    $level={level}
                  />
                </span>
              )}

            {Prefix.Component && !options?.disablePrefix && (Prefix.options?.isVisibleOnHover ? isHovered : true) && (
              <S.PrefixContainer>
                <Prefix.Component itemInstance={itemInstance} options={Prefix.options} />
              </S.PrefixContainer>
            )}

            {NameDisplay.Component ? (
              <NameDisplay.Component itemInstance={itemInstance} />
            ) : (
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
            )}

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
        </Wrapper>
      )}
    </ScrollIntoView>
  );
}

export default ItemRenderer;
