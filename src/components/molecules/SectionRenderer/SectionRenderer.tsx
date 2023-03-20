import React, {useCallback, useEffect, useMemo, useRef} from 'react';

import {isEqual} from 'lodash';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {collapseSectionIds, expandSectionIds} from '@redux/reducers/navigator';

import navSectionMap from '@src/navsections/sectionBlueprintMap';

import {ItemBlueprint, ItemGroupInstance, SectionInstance} from '@shared/models/navigator';

import ItemRenderer, {ItemRendererOptions} from './ItemRenderer';
import SectionHeader from './SectionHeader';
import {useSectionCustomization} from './useSectionCustomization';

import * as S from './styled';

type SectionRendererProps = {
  sectionId: string;
  level: number;
  isLastSection: boolean;
  parentIndentation?: number;
  itemRendererOptions?: ItemRendererOptions;
};

function SectionRenderer(props: SectionRendererProps) {
  const {sectionId, level, isLastSection, itemRendererOptions, parentIndentation} = props;

  const sectionBlueprintRef = useRef(navSectionMap.getById(sectionId));
  const itemBlueprintRef = useRef(sectionBlueprintRef.current?.itemBlueprint);

  const sectionInstance: SectionInstance | undefined = useAppSelector(
    state => state.navigator.sectionInstanceMap[sectionId],
    isEqual
  );
  const sectionInstanceRef = useRef(sectionInstance);
  sectionInstanceRef.current = sectionInstance;

  const registeredSectionIds = useAppSelector(state => state.navigator.registeredSectionBlueprintIds);

  const visibleChildSectionIds = useMemo(
    () => sectionInstance.visibleChildSectionIds?.filter(id => registeredSectionIds.includes(id)),
    [sectionInstance.visibleChildSectionIds, registeredSectionIds]
  );

  const dispatch = useAppDispatch();

  const {EmptyDisplay} = useSectionCustomization(sectionBlueprintRef.current?.customization);

  const collapsedSectionIds = useAppSelector(state => state.navigator.collapsedSectionIds);

  const sectionIndentation = useMemo(() => {
    const indentation = sectionBlueprintRef.current?.customization?.indentation;
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
  }, [parentIndentation]);

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
    if (!sectionInstanceRef.current?.id) {
      return;
    }
    if (
      !sectionInstanceRef.current?.visibleDescendantSectionIds ||
      sectionInstanceRef.current.visibleDescendantSectionIds.length === 0
    ) {
      dispatch(expandSectionIds([sectionInstanceRef.current.id]));
    } else {
      dispatch(
        expandSectionIds([sectionInstanceRef.current.id, ...sectionInstanceRef.current.visibleDescendantSectionIds])
      );
    }
  }, [dispatch]);

  const collapseSection = useCallback(() => {
    if (!sectionInstanceRef.current?.id) {
      return;
    }
    if (
      !sectionInstanceRef.current?.visibleDescendantSectionIds ||
      sectionInstanceRef.current.visibleDescendantSectionIds.length === 0
    ) {
      dispatch(collapseSectionIds([sectionInstanceRef.current?.id]));
    } else {
      dispatch(
        collapseSectionIds([sectionInstanceRef.current?.id, ...sectionInstanceRef.current.visibleDescendantSectionIds])
      );
    }
  }, [dispatch]);

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

  const isLastVisibleItemId = useCallback((itemId: string) => {
    if (!sectionInstanceRef.current?.visibleItemIds) {
      return false;
    }
    const lastVisibleItemId =
      sectionInstanceRef.current.visibleItemIds[sectionInstanceRef.current.visibleItemIds.length - 1];
    return itemId === lastVisibleItemId;
  }, []);

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

  if (!sectionInstance?.isInitialized && sectionBlueprintRef.current?.customization?.beforeInitializationText) {
    return (
      <S.BeforeInitializationContainer level={level}>
        <p>{sectionBlueprintRef.current?.customization.beforeInitializationText}</p>
      </S.BeforeInitializationContainer>
    );
  }

  if (!sectionInstance?.isVisible) {
    return null;
  }

  if (sectionInstance?.isLoading) {
    return <S.Skeleton active />;
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
        itemBlueprintRef.current &&
        sectionInstance.groups.length === 0 &&
        sectionInstance.visibleItemIds.map(itemId => (
          <ItemRenderer
            key={itemId}
            itemId={itemId}
            blueprint={itemBlueprintRef.current as ItemBlueprint<any, any>}
            level={level + 1}
            isLastItem={isLastVisibleItemId(itemId)}
            isSectionCheckable={Boolean(sectionInstance.checkable)}
            sectionContainerElementId={sectionBlueprintRef.current?.containerElementId || ''}
            options={itemRendererOptions}
            indentation={sectionIndentation || 0}
          />
        ))}
      {sectionInstance?.isVisible &&
        !isCollapsed &&
        itemBlueprintRef.current &&
        groupInstanceById &&
        sectionInstance.visibleGroupIds.map(groupId => {
          const group = groupInstanceById[groupId];
          return (
            <React.Fragment key={group.id}>
              <S.SectionContainer style={{color: 'red'}}>
                <S.Name $level={level + 2}>
                  {group.name}
                  <S.Counter selected={false}>{group.visibleItemIds.length}</S.Counter>
                </S.Name>
              </S.SectionContainer>
              {group.visibleItemIds.length ? (
                group.visibleItemIds.map(itemId => (
                  <ItemRenderer
                    key={itemId}
                    itemId={itemId}
                    blueprint={itemBlueprintRef.current as ItemBlueprint<any, any>}
                    level={level + 2}
                    isLastItem={isLastVisibleItemIdInGroup(group.id, itemId)}
                    isSectionCheckable={Boolean(sectionInstance.checkable)}
                    sectionContainerElementId={sectionBlueprintRef.current?.containerElementId || ''}
                    options={itemRendererOptions}
                    indentation={sectionIndentation || 0}
                  />
                ))
              ) : (
                <S.EmptyGroupText>
                  {sectionBlueprintRef.current?.customization?.emptyGroupText || 'No items in this group.'}
                </S.EmptyGroupText>
              )}
            </React.Fragment>
          );
        })}
      {visibleChildSectionIds &&
        visibleChildSectionIds.map(childId => (
          <SectionRenderer
            key={childId}
            sectionId={childId}
            level={level + 1}
            isLastSection={childId === lastVisibleChildSectionId}
            parentIndentation={sectionIndentation}
          />
        ))}
    </>
  );
}

export default React.memo(SectionRenderer, isEqual);
