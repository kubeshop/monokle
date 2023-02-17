import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {isEqual} from 'lodash';

import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {ScrollIntoView} from '@atoms';
import {ScrollContainerRef} from '@atoms/ScrollIntoView';

import {TextEllipsis} from '@monokle/components';
import {ItemBlueprint, ItemCustomComponentProps} from '@shared/models/navigator';

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

const WrapperPlacehoder: React.FC<ItemCustomComponentProps> = props => {
  const {children} = props;
  return <div>{children}</div>;
};

function ItemRenderer<ItemType, ScopeType>(props: ItemRendererProps<ItemType, ScopeType>) {
  const {itemId, blueprint, level, isLastItem, isSectionCheckable, sectionContainerElementId, indentation, options} =
    props;

  const instanceHandlerRef = useRef(blueprint.instanceHandler);
  instanceHandlerRef.current = blueprint.instanceHandler;

  const dispatch = useAppDispatch();
  const checkedResourceIds = useAppSelector(state => state.main.checkedResourceIdentifiers);
  const itemInstance = useAppSelector(state => state.navigator.itemInstanceMap[itemId], isEqual);

  const [isHovered, setIsHovered] = useState<boolean>(false);

  const {Prefix, Suffix, QuickAction, ContextMenu, ContextMenuWrapper, NameDisplay, Information} = useItemCustomization(
    blueprint.customization
  );

  const previouslyCheckedResourcesLength = useRef(checkedResourceIds.length);
  const scrollContainer = useRef<ScrollContainerRef>(null);

  const onClick = useCallback(() => {
    if (instanceHandlerRef.current && instanceHandlerRef.current.onClick && !itemInstance.isDisabled) {
      instanceHandlerRef.current.onClick(itemInstance, dispatch);
    }
  }, [itemInstance, dispatch]);

  const onCheck = useCallback(() => {
    if (instanceHandlerRef.current && instanceHandlerRef.current.onCheck && !itemInstance.isDisabled) {
      instanceHandlerRef.current.onCheck(itemInstance, dispatch);
    }
  }, [itemInstance, dispatch]);

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
    () => (ContextMenuWrapper.Component ? ContextMenuWrapper.Component : WrapperPlacehoder),
    [ContextMenuWrapper.Component]
  );

  return (
    <ScrollIntoView id={itemInstance.id} ref={scrollContainer} parentContainerElementId={sectionContainerElementId}>
      {Wrapper && (
        <Wrapper itemInstance={itemInstance} options={ContextMenuWrapper.options}>
          <S.ItemContainer
            $isDisabled={itemInstance.isDisabled}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            isSelected={itemInstance.isSelected}
            isHighlighted={itemInstance.isHighlighted}
            disableHoverStyle={Boolean(blueprint.customization?.disableHoverStyle)}
            isHovered={isHovered}
            level={level}
            isLastItem={isLastItem}
            hasOnClick={Boolean(instanceHandlerRef.current?.onClick)}
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
                <TextEllipsis text={`${itemInstance.name} ${itemInstance.isDirty ? '*' : ''}`} />
              </S.ItemName>
            )}

            {Suffix.Component && !options?.disableSuffix && (Suffix.options?.isVisibleOnHover ? isHovered : true) && (
              <S.SuffixContainer>
                <Suffix.Component itemInstance={itemInstance} options={Suffix.options} />
              </S.SuffixContainer>
            )}

            {Information.Component && (Information.options?.isVisibleOnHover ? isHovered : true) && (
              <S.InformationContainer>
                <Information.Component itemInstance={itemInstance} options={Information.options} />
              </S.InformationContainer>
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
        </Wrapper>
      )}
    </ScrollIntoView>
  );
}

export default memo(ItemRenderer, isEqual);
