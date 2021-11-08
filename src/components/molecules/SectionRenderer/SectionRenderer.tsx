import React, {useCallback, useEffect, useMemo} from 'react';
import {ItemGroupInstance, SectionBlueprint, SectionInstance} from '@models/navigator';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import navSectionMap from '@src/navsections/sectionBlueprintMap';
import {collapseSectionIds, expandSectionIds} from '@redux/reducers/navigator';
import ItemRenderer, {ItemRendererOptions} from './ItemRenderer';
import SectionHeader from './SectionHeader';
import * as S from './styled';
import {useSectionCustomization} from './useSectionCustomization';

type SectionRendererProps<ItemType, ScopeType> = {
  sectionBlueprint: SectionBlueprint<ItemType, ScopeType>;
  level: number;
  isLastSection: boolean;
  itemRendererOptions?: ItemRendererOptions;
};

function SectionRenderer<ItemType, ScopeType>(props: SectionRendererProps<ItemType, ScopeType>) {
  const {sectionBlueprint, level, isLastSection, itemRendererOptions} = props;

  const {itemBlueprint, name: sectionName, id: sectionId} = sectionBlueprint;

  const sectionInstance: SectionInstance | undefined = useAppSelector(
    state => state.navigator.sectionInstanceMap[sectionId]
  );

  const dispatch = useAppDispatch();

  const {NameDisplay} = useSectionCustomization(sectionBlueprint.customization);

  const collapsedSectionIds = useAppSelector(state => state.navigator.collapsedSectionIds);

  const isCollapsedMode = useMemo(() => {
    if (!sectionInstance?.id) {
      return 'expanded';
    }
    const visibleDescendantSectionIds = sectionInstance?.visibleDescendantSectionIds;
    if (visibleDescendantSectionIds) {
      if (
        collapsedSectionIds.includes(sectionInstance.id) &&
        visibleDescendantSectionIds.every(s => collapsedSectionIds.includes(s))
      ) {
        return 'collapsed';
      }
      if (
        !collapsedSectionIds.includes(sectionInstance.id) &&
        visibleDescendantSectionIds.every(s => !collapsedSectionIds.includes(s))
      ) {
        return 'expanded';
      }
      return 'mixed';
    }
    if (collapsedSectionIds.includes(sectionInstance.id)) {
      return 'collapsed';
    }
    return 'expanded';
  }, [collapsedSectionIds, sectionInstance?.id, sectionInstance?.visibleDescendantSectionIds]);

  const isCollapsed = useMemo(() => {
    return isCollapsedMode === 'collapsed';
  }, [isCollapsedMode]);

  const expandSection = useCallback(() => {
    if (!sectionInstance?.id) {
      return;
    }
    if (!sectionInstance?.visibleDescendantSectionIds || sectionInstance.visibleDescendantSectionIds.length === 0) {
      dispatch(expandSectionIds([sectionInstance.id]));
    } else {
      dispatch(expandSectionIds([sectionInstance.id, ...sectionInstance.visibleDescendantSectionIds]));
    }
  }, [sectionInstance?.id, sectionInstance?.visibleDescendantSectionIds, dispatch]);

  const collapseSection = useCallback(() => {
    if (!sectionInstance?.id) {
      return;
    }
    if (!sectionInstance?.visibleDescendantSectionIds || sectionInstance.visibleDescendantSectionIds.length === 0) {
      dispatch(collapseSectionIds([sectionInstance?.id]));
    } else {
      dispatch(collapseSectionIds([sectionInstance?.id, ...sectionInstance.visibleDescendantSectionIds]));
    }
  }, [sectionInstance?.id, sectionInstance?.visibleDescendantSectionIds, dispatch]);

  useEffect(() => {
    if (sectionInstance?.shouldExpand) {
      expandSection();
    }
  }, [sectionInstance?.shouldExpand, expandSection]);

  const groupInstanceById: Record<string, ItemGroupInstance> = useMemo(() => {
    return sectionInstance?.groups
      .map<[string, ItemGroupInstance]>(g => [g.id, g])
      .reduce<Record<string, ItemGroupInstance>>((acc, [k, v]) => {
        acc[k] = v;
        return acc;
      }, {});
  }, [sectionInstance?.groups]);

  const lastVisibleChildSectionId = useMemo(() => {
    if (!sectionInstance?.visibleChildSectionIds) {
      return undefined;
    }
    return sectionInstance.visibleChildSectionIds
      ? sectionInstance.visibleChildSectionIds[sectionInstance.visibleChildSectionIds.length - 1]
      : undefined;
  }, [sectionInstance?.visibleChildSectionIds]);

  const isLastVisibleItemId = useCallback(
    (itemId: string) => {
      if (!sectionInstance?.visibleItemIds) {
        return false;
      }
      const lastVisibleItemId = sectionInstance.visibleItemIds[sectionInstance.visibleItemIds.length - 1];
      return itemId === lastVisibleItemId;
    },
    [sectionInstance?.visibleItemIds]
  );

  const isLastVisibleItemIdInGroup = useCallback(
    (groupId: string, itemId: string) => {
      const groupInstance = groupInstanceById[groupId];
      if (!groupInstance) {
        return false;
      }
      const lastVisibleItemIdInGroup = groupInstance.visibleItemIds[groupInstance.visibleItemIds.length - 1];
      return itemId === lastVisibleItemIdInGroup;
    },
    [groupInstanceById]
  );

  if (!sectionInstance?.isVisible) {
    return null;
  }

  if (sectionInstance?.isLoading) {
    return <S.Skeleton />;
  }

  return (
    <>
      <SectionHeader
        name={sectionName}
        sectionInstance={sectionInstance}
        isSectionSelected={Boolean(sectionInstance?.isSelected)}
        isCollapsed={isCollapsed}
        isCollapsedMode={isCollapsedMode}
        isSectionHighlighted={Boolean(sectionInstance?.isHighlighted)}
        isLastSection={isLastSection}
        hasChildSections={Boolean(sectionBlueprint.childSectionIds && sectionBlueprint.childSectionIds.length > 0)}
        isSectionInitialized={Boolean(sectionInstance?.isInitialized)}
        isSectionVisible={Boolean(sectionInstance?.isVisible)}
        level={level}
        itemsLength={sectionInstance?.visibleDescendantItemsCount || 0}
        expandSection={expandSection}
        collapseSection={collapseSection}
        CustomNameDisplay={NameDisplay ? NameDisplay.Component : undefined}
        disableHoverStyle={Boolean(sectionBlueprint.customization?.disableHoverStyle)}
      />
      {sectionInstance &&
        sectionInstance.isVisible &&
        !isCollapsed &&
        itemBlueprint &&
        sectionInstance.groups.length === 0 &&
        sectionInstance.visibleItemIds.map(itemId => (
          <ItemRenderer<ItemType, ScopeType>
            key={itemId}
            itemId={itemId}
            blueprint={itemBlueprint}
            level={level + 1}
            isLastItem={isLastVisibleItemId(itemId)}
            options={itemRendererOptions}
          />
        ))}
      {sectionInstance?.isVisible &&
        !isCollapsed &&
        itemBlueprint &&
        groupInstanceById &&
        sectionInstance.visibleGroupIds.map(groupId => {
          const group = groupInstanceById[groupId];
          return (
            <React.Fragment key={group.id}>
              <S.NameContainer style={{color: 'red'}}>
                <S.Name level={level + 1}>
                  {group.name}
                  <S.ItemsLength>{group.visibleItemIds.length}</S.ItemsLength>
                </S.Name>
              </S.NameContainer>
              {group.visibleItemIds.map(itemId => (
                <ItemRenderer<ItemType, ScopeType>
                  key={itemId}
                  itemId={itemId}
                  blueprint={itemBlueprint}
                  level={level + 2}
                  isLastItem={isLastVisibleItemIdInGroup(group.id, itemId)}
                  options={itemRendererOptions}
                />
              ))}
            </React.Fragment>
          );
        })}
      {sectionBlueprint.childSectionIds &&
        sectionBlueprint.childSectionIds
          .map(childSectionId => navSectionMap.getById(childSectionId))
          .map(child => (
            <SectionRenderer<ItemType, ScopeType>
              key={child.name}
              sectionBlueprint={child}
              level={level + 1}
              isLastSection={child.id === lastVisibleChildSectionId}
            />
          ))}
    </>
  );
}

export default SectionRenderer;
