import React, {useCallback, useMemo, useState} from 'react';

import {ItemCustomComponentProps} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';

import sectionBlueprintMap from '@src/navsections/sectionBlueprintMap';

import {useItemCustomization} from './useItemCustomization';

import * as S from './styled';

export type ItemRendererOptions = {
  disablePrefix?: boolean;
  disableSuffix?: boolean;
  disableQuickAction?: boolean;
  disableContextMenu?: boolean;
};

export type ItemRendererProps = {
  itemId: string;
  sectionId: string;
  level: number;
  isLastItem: boolean;
  isSectionCheckable: boolean;
  indentation: number;
  options?: ItemRendererOptions;
};

const WrapperPlacehoder: React.FC<ItemCustomComponentProps> = props => {
  const {children} = props;
  return <div>{children}</div>;
};

function ItemRenderer(props: ItemRendererProps) {
  const {itemId, sectionId, level, isLastItem, isSectionCheckable, indentation, options} = props;
  // const {instanceHandler} = blueprint;

  const sectionBlueprint = useMemo(() => sectionBlueprintMap.getById(sectionId), [sectionId]);
  const {itemBlueprint} = sectionBlueprint || {};
  const {instanceHandler} = itemBlueprint || {};

  const dispatch = useAppDispatch();
  const itemInstance = useAppSelector(state => state.navigator.itemInstanceMap[itemId]);

  const [isHovered, setIsHovered] = useState<boolean>(false);

  const {Prefix, Suffix, QuickAction, ContextMenu, ContextMenuWrapper, NameDisplay} = useItemCustomization(
    itemBlueprint?.customization
  );

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

  const Wrapper = useMemo(
    () => (ContextMenuWrapper.Component ? ContextMenuWrapper.Component : WrapperPlacehoder),
    [ContextMenuWrapper.Component]
  );

  return (
    <div style={{width: '100%'}}>
      <Wrapper itemInstance={itemInstance} options={ContextMenuWrapper.options}>
        <S.ItemContainer
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          isSelected={itemInstance.isSelected}
          isHighlighted={itemInstance.isHighlighted}
          disableHoverStyle={Boolean(itemBlueprint?.customization?.disableHoverStyle)}
          isHovered={isHovered}
          level={level}
          isLastItem={isLastItem}
          hasOnClick={Boolean(instanceHandler?.onClick)}
          $indentation={indentation}
          $isSectionCheckable={isSectionCheckable}
          $hasCustomNameDisplay={Boolean(NameDisplay.Component)}
          $lastItemMarginBottom={itemBlueprint?.customization?.lastItemMarginBottom}
        >
          {itemInstance.isCheckable &&
            (itemBlueprint?.customization?.isCheckVisibleOnHover ? itemInstance.isChecked || isHovered : true) && (
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
    </div>
  );
}

export default ItemRenderer;
