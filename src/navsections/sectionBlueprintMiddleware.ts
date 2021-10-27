import {shallowEqual} from 'react-redux';
import {Middleware} from 'redux';
import {updateNavigatorState} from '@redux/reducers/navigator';
import {ItemInstance, NavigatorState, SectionInstance} from '@models/navigator';
import {AppDispatch, RootState} from '@redux/store';
import asyncLib from 'async';
import sectionBlueprintMap from './sectionBlueprintMap';

const fullScopeCache: Record<string, any> = {};

const pickPartialRecord = (record: Record<string, any>, keys: string[]) => {
  // return Object.fromEntries(Object.entries(record).filter(([key]) => keys.includes(key)));
  return Object.entries(record)
    .filter(([key]) => keys.includes(key))
    .reduce<Record<string, any>>((acc, [k, v]) => {
      acc[k] = v;
      return acc;
    }, {});
};

const hasNavigatorStateChanged = (navigatorState: NavigatorState, newNavigatorState: NavigatorState) => {
  const {itemInstanceMap, sectionInstanceMap} = newNavigatorState;
  return (
    !shallowEqual(pickPartialRecord(navigatorState.itemInstanceMap, Object.keys(itemInstanceMap)), itemInstanceMap) ||
    !shallowEqual(
      pickPartialRecord(navigatorState.sectionInstanceMap, Object.keys(sectionInstanceMap)),
      sectionInstanceMap
    )
  );
};

const processSectionBlueprints = (state: RootState, dispatch: AppDispatch) => {
  const sectionInstanceMap: Record<string, SectionInstance> = {};
  const itemInstanceMap: Record<string, ItemInstance> = {};

  const fullScope: Record<string, any> = {};
  const scopeKeysBySectionId: Record<string, string[]> = {};
  const isChangedByScopeKey: Record<string, boolean> = {};

  asyncLib.each(sectionBlueprintMap.getAll(), async sectionBlueprint => {
    const sectionScope = sectionBlueprint.getScope(state);
    const sectionScopeKeys: string[] = [];
    Object.entries(sectionScope).forEach(([key, value]) => {
      sectionScopeKeys.push(key);
      if (fullScope[key]) {
        return;
      }
      fullScope[key] = value;
      if (!shallowEqual(fullScopeCache[key], value)) {
        isChangedByScopeKey[key] = true;
      } else {
        isChangedByScopeKey[key] = false;
      }
    });
    scopeKeysBySectionId[sectionBlueprint.id] = sectionScopeKeys;
  });

  if (Object.values(isChangedByScopeKey).every(isChanged => isChanged === false)) {
    console.log('fullScope did not change.');
    return;
  }

  asyncLib.each(sectionBlueprintMap.getAll(), async sectionBlueprint => {
    const sectionScopeKeys = scopeKeysBySectionId[sectionBlueprint.id];
    const hasSectionScopeChanged = Object.entries(isChangedByScopeKey).some(
      ([key, value]) => sectionScopeKeys.includes(key) && value === true
    );
    if (!hasSectionScopeChanged) {
      console.log(`Section ${sectionBlueprint.id} scope did not change`);
      return;
    }
    const sectionScope = pickPartialRecord(fullScope, scopeKeysBySectionId[sectionBlueprint.id]);

    const sectionBuilder = sectionBlueprint.builder;
    const itemBlueprint = sectionBlueprint.itemBlueprint;

    let itemInstances: ItemInstance[] | undefined;
    let rawItems: any[] = [];

    if (itemBlueprint) {
      rawItems = (sectionBlueprint.builder?.getRawItems && sectionBlueprint.builder.getRawItems(sectionScope)) || [];
      const itemBuilder = itemBlueprint.builder;
      itemInstances = rawItems?.map(rawItem => {
        return {
          name: itemBlueprint.getName(rawItem),
          id: itemBlueprint.getInstanceId(rawItem),
          isSelected: Boolean(itemBuilder?.isSelected && itemBuilder.isSelected(rawItem, sectionScope)),
          isHighlighted: Boolean(itemBuilder?.isHighlighted && itemBuilder.isHighlighted(rawItem, sectionScope)),
          isVisible: Boolean(itemBuilder?.isVisible && itemBuilder.isVisible(rawItem, sectionScope)),
          isDirty: Boolean(itemBuilder?.isDirty && itemBuilder.isDirty(rawItem, sectionScope)),
          isDisabled: Boolean(itemBuilder?.isDisabled && itemBuilder.isDisabled(rawItem, sectionScope)),
          shouldScrollIntoView: Boolean(
            itemBuilder?.shouldScrollIntoView && itemBuilder.shouldScrollIntoView(rawItem, sectionScope)
          ),
        };
      });
    }

    const isSectionSelected = Boolean(itemInstances?.some(i => i.isSelected === true));
    const isSectionHighlighted = Boolean(itemInstances?.some(i => i.isHighlighted === true));
    const sectionGroups = sectionBuilder?.getGroups ? sectionBuilder.getGroups(sectionScope) : [];
    const visibleItemIds = itemInstances?.filter(i => i.isVisible === true).map(i => i.id) || [];
    const visibleGroupIds = sectionGroups
      .filter(g => g.itemIds.some(itemId => itemInstanceMap[itemId].isVisible === true))
      .map(g => g.id);
    const navSectionInstance: SectionInstance = {
      id: sectionBlueprint.id,
      itemIds: itemInstances?.map(i => i.id) || [],
      groups: sectionGroups,
      isLoading: Boolean(sectionBuilder?.isLoading && sectionBuilder.isLoading(sectionScope, rawItems)),
      // isVisible: Boolean(
      //   sectionBuilder?.isVisible &&
      //     sectionBuilder.isVisible(sectionScope, rawItems) &&
      //     (visibleItemIds.length > 0 || visibleGroupIds.length > 0)
      // ),
      isVisible: true,
      isInitialized: Boolean(sectionBuilder?.isInitialized && sectionBuilder.isInitialized(sectionScope, rawItems)),
      isSelected: isSectionSelected,
      isHighlighted: isSectionHighlighted,
      shouldExpand: Boolean(
        itemInstances?.some(itemInstance => itemInstance.isVisible && itemInstance.shouldScrollIntoView)
      ),
      visibleItemIds,
      visibleGroupIds,
    };
    sectionInstanceMap[sectionBlueprint.id] = navSectionInstance;
    itemInstances?.forEach(itemInstance => {
      itemInstanceMap[itemInstance.id] = itemInstance;
    });
  });

  // const sectionInstanceRoots = Object.values(sectionInstanceMap).filter(
  //   sectionInstance => !sectionBlueprintMap.getById(sectionInstance.id).parentSectionId
  // );

  // const computeSectionVisibility = (sectionInstance: SectionInstance) => {
  //   const sectionBlueprint = sectionBlueprintMap.getById(sectionInstance.id);
  //   if (sectionBlueprint.childSectionIds && sectionBlueprint.childSectionIds.length > 0) {
  //     const childSectionVisibilityMap: Record<string, boolean> = {};
  //     sectionBlueprint.childSectionIds.forEach(childSectionId => {
  //       const childSectionInstance = sectionInstanceMap[childSectionId];
  //       const isChildSectionVisible = computeSectionVisibility(childSectionInstance);
  //       childSectionVisibilityMap[childSectionId] = isChildSectionVisible;
  //     });
  //     sectionInstance.isVisible =
  //       sectionInstance.isVisible || Object.values(childSectionVisibilityMap).some(isVisible => isVisible === true);
  //   }
  //   return sectionInstance.isVisible;
  // };

  // sectionInstanceRoots.forEach(sectionInstanceRoot => computeSectionVisibility(sectionInstanceRoot));

  if (Object.keys(itemInstanceMap).length === 0 && Object.keys(sectionInstanceMap).length === 0) {
    return;
  }

  const newNavigatorState: NavigatorState = {
    sectionInstanceMap,
    itemInstanceMap,
  };

  if (hasNavigatorStateChanged(state.navigator, newNavigatorState)) {
    dispatch(updateNavigatorState(newNavigatorState));
  }
};

export const sectionBlueprintMiddleware: Middleware = store => next => action => {
  next(action);
  if (action?.type === updateNavigatorState.type) {
    console.log('Not processing.');
    return;
  }
  const state: RootState = store.getState();
  processSectionBlueprints(state, store.dispatch);
};
