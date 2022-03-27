import React, {useCallback, useEffect, useMemo} from 'react';

import {ItemGroupInstance, SectionBlueprint, SectionInstance} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {collapseSectionIds, expandSectionIds} from '@redux/reducers/navigator';

import navSectionMap from '@src/navsections/sectionBlueprintMap';

import ItemRenderer, {ItemRendererOptions} from './ItemRenderer';
import SectionHeader from './SectionHeader';
import {useSectionCustomization} from './useSectionCustomization';

import * as S from './styled';

type SectionRendererProps = {
  sectionBlueprint: SectionBlueprint<any>;
  level: number;
  isLastSection: boolean;
  parentIndentation?: number;
  itemRendererOptions?: ItemRendererOptions;
};

function SectionRenderer(props: SectionRendererProps) {
  const {sectionBlueprint, level, isLastSection, itemRendererOptions, parentIndentation} = props;

  const {itemBlueprint, id: sectionId} = sectionBlueprint;

  const sectionInstance: SectionInstance | undefined = useAppSelector(
    state => state.navigator.sectionInstanceMap[sectionId]
  );

  const registeredSectionIds = useAppSelector(state => state.navigator.registeredSectionBlueprintIds);
  const childSectionIds = useMemo(() => {
    return sectionBlueprint.childSectionIds?.filter(id => registeredSectionIds.includes(id));
  }, [sectionBlueprint.childSectionIds, registeredSectionIds]);

  const childSections = useMemo(() => {
    return childSectionIds
      ?.map(id => navSectionMap.getById(id))
      .filter((s): s is SectionBlueprint<any, any> => s !== undefined);
  }, [childSectionIds]);

  const dispatch = useAppDispatch();

  const {EmptyDisplay} = useSectionCustomization(sectionBlueprint.customization);

  const collapsedSectionIds = useAppSelector(state => state.navigator.collapsedSectionIds);

  const sectionIndentation = useMemo(() => {
    const indentation = sectionBlueprint.customization?.indentation;
    if (!parentIndentation && !indentation) {
      return undefined;
    }
    if (parentIndentation && !indentation) {
      return parentIndentation;
    }
    if (!parentIndentation && indentation) {
      return indentation;
    }
    if (parentIndentation && indentation) {
      return parentIndentation + indentation;
    }
    return undefined;
  }, [parentIndentation, sectionBlueprint.customization?.indentation]);

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

  if (!sectionInstance?.isInitialized && sectionBlueprint.customization?.beforeInitializationText) {
    return (
      <S.BeforeInitializationContainer level={level}>
        <p>{sectionBlueprint.customization.beforeInitializationText}</p>
      </S.BeforeInitializationContainer>
    );
  }

  if (!sectionInstance?.isVisible) {
    return null;
  }

  if (sectionInstance?.isLoading) {
    return <S.Skeleton />;
  }

  if (sectionInstance?.isEmpty) {
    if (EmptyDisplay && EmptyDisplay.Component) {
      return (
        <S.EmptyDisplayContainer level={level}>
          <EmptyDisplay.Component sectionInstance={sectionInstance} />
        </S.EmptyDisplayContainer>
      );
    }
    return (
      <S.EmptyDisplayContainer level={level}>
        <h1>{sectionInstance.name}</h1>
        <p>Section is empty.</p>
      </S.EmptyDisplayContainer>
    );
  }

  return (
    <>
      <SectionHeader
        name={sectionInstance.name}
        sectionInstance={sectionInstance}
        sectionBlueprint={sectionBlueprint}
        isCollapsed={isCollapsed}
        isLastSection={isLastSection}
        level={level}
        expandSection={expandSection}
        collapseSection={collapseSection}
        indentation={sectionIndentation || 0}
      />
      {sectionInstance &&
        sectionInstance.isVisible &&
        !isCollapsed &&
        itemBlueprint &&
        sectionInstance.groups.length === 0 &&
        sectionInstance.visibleItemIds.map(itemId => (
          <ItemRenderer
            key={itemId}
            itemId={itemId}
            blueprint={itemBlueprint}
            level={level + 1}
            isLastItem={isLastVisibleItemId(itemId)}
            isSectionCheckable={Boolean(sectionInstance.checkable)}
            sectionContainerElementId={sectionBlueprint.containerElementId}
            options={itemRendererOptions}
            indentation={sectionIndentation || 0}
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
              <S.SectionContainer style={{color: 'red'}}>
                <S.Name $level={level + 1}>
                  {group.name}
                  <S.Counter selected={false}>{group.visibleItemIds.length}</S.Counter>
                </S.Name>
              </S.SectionContainer>
              {group.visibleItemIds.length ? (
                group.visibleItemIds.map(itemId => (
                  <ItemRenderer
                    key={itemId}
                    itemId={itemId}
                    blueprint={itemBlueprint}
                    level={level + 2}
                    isLastItem={isLastVisibleItemIdInGroup(group.id, itemId)}
                    isSectionCheckable={Boolean(sectionInstance.checkable)}
                    sectionContainerElementId={sectionBlueprint.containerElementId}
                    options={itemRendererOptions}
                    indentation={sectionIndentation || 0}
                  />
                ))
              ) : (
                <S.EmptyGroupText>
                  {sectionBlueprint.customization?.emptyGroupText || 'No items in this group.'}
                </S.EmptyGroupText>
              )}
            </React.Fragment>
          );
        })}
      {childSections &&
        childSections.map(child => (
          <SectionRenderer
            key={child.name}
            sectionBlueprint={child}
            level={level + 1}
            isLastSection={child.id === lastVisibleChildSectionId}
            parentIndentation={sectionIndentation}
          />
        ))}
      {sectionBlueprint.customization?.sectionMarginBottom !== undefined && (
        <div style={{marginBottom: sectionBlueprint.customization.sectionMarginBottom}} />
      )}
    </>
  );
}

export default React.memo(SectionRenderer);
