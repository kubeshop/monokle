import React, {useCallback, useMemo, useState} from 'react';

import {NavigatorItemRow, SectionInstance} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';

import sectionBlueprintMap from '@src/navsections/sectionBlueprintMap';

import {useItemCustomization} from './useItemCustomization';

import * as S from './styled';

export type ItemRendererProps = {
  itemRow: NavigatorItemRow;
};

function ItemRenderer(props: ItemRendererProps) {
  const {itemRow} = props;
  const itemId = itemRow.id;
  const sectionId = itemRow.sectionId;

  const sectionBlueprint = useMemo(() => sectionBlueprintMap.getById(sectionId), [sectionId]);
  const {itemBlueprint} = sectionBlueprint || {};
  const {instanceHandler} = itemBlueprint || {};

  const dispatch = useAppDispatch();
  const itemInstance = useAppSelector(state => state.navigator.itemInstanceMap[itemId]);
  const isSectionCheckable = useAppSelector(state => {
    const sectionInstance: SectionInstance | undefined = state.navigator.sectionInstanceMap[sectionId];
    return Boolean(sectionInstance?.checkable);
  });

  const [isHovered, setIsHovered] = useState<boolean>(false);

  const {customPrefix, customSuffix, customQuickAction, customContextMenu, customRow} = useItemCustomization(
    itemBlueprint?.customization,
    isHovered
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

  return (
    <div style={{width: '100%', marginBottom: itemRow.marginBottom, height: itemRow.height}}>
      <S.ItemContainer
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        $isSelected={itemInstance.isSelected}
        $isHighlighted={itemInstance.isHighlighted}
        $disableHoverStyle={Boolean(itemBlueprint?.customization?.row?.disableHoverStyle)}
        $isHovered={isHovered}
        $hasOnClick={Boolean(instanceHandler?.onClick)}
        $indentation={itemRow.indentation}
        $isSectionCheckable={isSectionCheckable}
        $hasCustomRow={Boolean(customRow.Component)}
      >
        {itemInstance.isCheckable &&
          (itemBlueprint?.customization?.checkbox?.isVisibleOnHover ? itemInstance.isChecked || isHovered : true) && (
            <span>
              <S.Checkbox
                checked={itemInstance.isChecked}
                disabled={itemInstance.isDisabled}
                onChange={() => onCheck()}
              />
            </span>
          )}

        {customPrefix.Component && customPrefix.isVisible && (
          <S.PrefixContainer>
            <customPrefix.Component itemInstance={itemInstance} />
          </S.PrefixContainer>
        )}

        {customRow.Component ? (
          <customRow.Component itemInstance={itemInstance} />
        ) : (
          <S.ItemName
            $isSelected={itemInstance.isSelected}
            $isDirty={itemInstance.isDirty}
            $isHighlighted={itemInstance.isHighlighted}
            $isDisabled={itemInstance.isDisabled}
            onClick={onClick}
          >
            {itemInstance.name}
            {itemInstance.isDirty && <span>*</span>}
          </S.ItemName>
        )}

        {customSuffix.Component && customSuffix.isVisible && (
          <S.SuffixContainer>
            <customSuffix.Component itemInstance={itemInstance} />
          </S.SuffixContainer>
        )}

        <S.BlankSpace onClick={onClick} />

        {customQuickAction.Component && customQuickAction.isVisible && (
          <S.QuickActionContainer>
            <customQuickAction.Component itemInstance={itemInstance} />
          </S.QuickActionContainer>
        )}
        {customContextMenu.Component && customContextMenu.isVisible && (
          <S.ContextMenuContainer>
            <customContextMenu.Component itemInstance={itemInstance} />
          </S.ContextMenuContainer>
        )}
      </S.ItemContainer>
    </div>
  );
}

export default ItemRenderer;
