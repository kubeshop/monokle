import React, {useCallback, useMemo} from 'react';
import {ItemGroupInstance, SectionBlueprint, SectionInstance} from '@models/navigator';
import {useAppSelector} from '@redux/hooks';
import navSectionMap from '@src/navsections/sectionBlueprintMap';
import ItemRenderer from './ItemRenderer';
import NavSectionHeader from './SectionHeader';
import * as S from './styled';

type SectionRendererProps<ItemType, ScopeType> = {
  sectionBlueprint: SectionBlueprint<ItemType, ScopeType>;
  level: number;
  isLastSection: boolean;
};

function SectionRenderer<ItemType, ScopeType>(props: SectionRendererProps<ItemType, ScopeType>) {
  const {sectionBlueprint, level, isLastSection} = props;

  const {itemBlueprint, name: sectionName, id: sectionId} = sectionBlueprint;

  const sectionInstance: SectionInstance | undefined = useAppSelector(
    state => state.navigator.sectionInstanceMap[sectionId]
  );

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
      <NavSectionHeader
        name={sectionName}
        isSectionSelected={Boolean(sectionInstance?.isSelected)}
        isCollapsed={false}
        isSectionHighlighted={Boolean(sectionInstance?.isHighlighted)}
        isLastSection={isLastSection}
        hasChildSections={Boolean(sectionBlueprint.childSectionIds && sectionBlueprint.childSectionIds.length > 0)}
        isSectionInitialized={Boolean(sectionInstance?.isInitialized)}
        isSectionVisible={Boolean(sectionInstance?.isVisible)}
        isCollapsedMode="expanded"
        level={level}
        itemsLength={sectionInstance?.visibleItemIds.length || 0}
        expandSection={() => {}}
        collapseSection={() => {}}
      />
      {sectionInstance &&
        sectionInstance.isVisible && // !isCollapsed &&
        itemBlueprint &&
        sectionInstance.groups.length === 0 &&
        sectionInstance.visibleItemIds.map(itemId => (
          <ItemRenderer<ItemType, ScopeType>
            key={itemId}
            itemId={itemId}
            blueprint={itemBlueprint}
            level={level + 1}
            isLastItem={isLastVisibleItemId(itemId)}
          />
        ))}
      {sectionInstance?.isVisible &&
        itemBlueprint &&
        groupInstanceById &&
        sectionInstance.visibleGroupIds.map(groupId => {
          const group = groupInstanceById[groupId];
          return (
            <React.Fragment key={group.id}>
              <S.NameContainer style={{color: 'red'}}>
                <S.Name level={level + 1}>{group.name}</S.Name>
              </S.NameContainer>
              {group.visibleItemIds.map(itemId => (
                <ItemRenderer<ItemType, ScopeType>
                  key={itemId}
                  itemId={itemId}
                  blueprint={itemBlueprint}
                  level={level + 2}
                  isLastItem={isLastVisibleItemIdInGroup(group.id, itemId)}
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
