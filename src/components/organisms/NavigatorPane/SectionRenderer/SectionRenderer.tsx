import React, {useCallback} from 'react';
import {SectionBlueprint, SectionInstance} from '@models/navigator';
import {useAppSelector} from '@redux/hooks';
// import {shallowEqual} from 'react-redux';
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

  // console.log({sectionInstance});

  // const sectionItemInstanceMap = useAppSelector(
  //   state =>
  //     Object.fromEntries(
  //       Object.values(state.navigator.itemInstanceMap)
  //         .filter(i => sectionInstance?.itemIds.includes(i.id))
  //         .map(i => [i.id, i])
  //     ),
  //   shallowEqual
  // );

  // const visibleItemInstances = useMemo(() => {
  //   return Object.values(sectionItemInstanceMap).filter(i => i.isVisible === true);
  // }, [sectionItemInstanceMap]);

  // const visibleGroups = useMemo(() => {
  //   return sectionInstance?.groups.filter(g => sectionInstance?.visibleGroupIds.includes(g.id));
  // }, [sectionInstance?.groups, sectionInstance?.visibleGroupIds]);

  // const isLastVisibleItemInstance = useCallback(
  //   (itemId: string) => {
  //     const lastVisibleItem = visibleItemInstances[visibleItemInstances.length - 1];
  //     return Boolean(lastVisibleItem && lastVisibleItem.id === itemId);
  //   },
  //   [visibleItemInstances]
  // );

  // const isLastVisibleItemInstanceInGroup = useCallback(
  //   (groupId: string, itemId: string) => {
  //     const isGroupVisible = sectionInstance?.visibleGroupIds.some(gid => gid === groupId);
  //     if (!isGroupVisible) {
  //       return false;
  //     }
  //     const group = sectionInstance?.groups.find(g => g.id === groupId);
  //     if (!group) {
  //       return false;
  //     }
  //     const groupVisibleItems = group.itemIds.map(id => sectionItemInstanceMap[id]).filter(i => i.isVisible);
  //     const lastVisibleItem = groupVisibleItems[groupVisibleItems.length - 1];
  //     return Boolean(lastVisibleItem && lastVisibleItem.id === itemId);
  //   },
  //   [sectionInstance?.groups, sectionItemInstanceMap, sectionInstance?.visibleGroupIds]
  // );

  const isGroupVisible = useCallback(
    (groupId: string) => {
      return sectionInstance?.visibleGroupIds.some(gid => gid === groupId);
    },
    [sectionInstance?.visibleGroupIds]
  );

  // const isLastVisibleSection = useCallback(
  //   (subsectionName: string) => {
  //     const lastVisibleSection = visibleSubsections ? visibleSubsections[visibleSubsections.length - 1] : undefined;
  //     return Boolean(lastVisibleSection && lastVisibleSection.name === subsectionName);
  //   },
  //   [visibleSubsections]
  // );

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
            isLastItem={false}
          />
        ))}
      {/* {sectionInstance?.isVisible && // !isCollapsed &&
        itemBlueprint &&
        sectionInstance.visibleGroupIds.map(groupId => (
          <React.Fragment key={group.id}>
            <S.NameContainer style={{color: 'red'}}>
              <S.Name level={level + 1}>{group.name}</S.Name>
            </S.NameContainer>
            {group.itemIds.map(itemId => (
              <ItemRenderer<ItemType, ScopeType>
                key={itemId}
                itemId={itemId}
                blueprint={itemBlueprint}
                level={level + 2}
                isLastItem={false} // isLastVisibleItemInstanceInGroup(group.name, itemInstance.id)
              />
            ))}
          </React.Fragment>
        ))} */}
      {sectionBlueprint.childSectionIds &&
        sectionBlueprint.childSectionIds
          .map(childSectionId => navSectionMap.getById(childSectionId))
          .map(child => (
            <SectionRenderer<ItemType, ScopeType>
              key={child.name}
              sectionBlueprint={child}
              level={level + 1}
              isLastSection={false} // isLastVisibleSection(child.name)
            />
          ))}
    </>
  );
}

export default SectionRenderer;
