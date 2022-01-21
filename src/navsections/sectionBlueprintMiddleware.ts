import {shallowEqual} from 'react-redux';

import asyncLib from 'async';
import log from 'loglevel';
import {Middleware} from 'redux';

import {AppDispatch} from '@models/appdispatch';
import {ItemInstance, NavigatorInstanceState, SectionBlueprint, SectionInstance} from '@models/navigator';
import {RootState} from '@models/rootstate';

import {collapseSectionIds, expandSectionIds, updateNavigatorInstanceState} from '@redux/reducers/navigator';

import sectionBlueprintMap from './sectionBlueprintMap';

const fullScopeCache: Record<string, any> = {};

const pickPartialRecord = (record: Record<string, any>, keys: string[]) => {
  return Object.entries(record)
    .filter(([key]) => keys.includes(key))
    .reduce<Record<string, any>>((acc, [k, v]) => {
      acc[k] = v;
      return acc;
    }, {});
};

const hasNavigatorInstanceStateChanged = (
  navigatorState: NavigatorInstanceState,
  newNavigatorInstanceState: NavigatorInstanceState
) => {
  const {itemInstanceMap, sectionInstanceMap} = newNavigatorInstanceState;
  return (
    !shallowEqual(pickPartialRecord(navigatorState.itemInstanceMap, Object.keys(itemInstanceMap)), itemInstanceMap) ||
    !shallowEqual(
      pickPartialRecord(navigatorState.sectionInstanceMap, Object.keys(sectionInstanceMap)),
      sectionInstanceMap
    )
  );
};

function isScrolledIntoView(elementId: string, containerElementHeight: number) {
  const element = document.getElementById(elementId);
  const boundingClientRect = element?.getBoundingClientRect();
  if (!boundingClientRect) {
    return false;
  }
  const elementTop = boundingClientRect.top;
  const elementBottom = boundingClientRect.bottom;
  return elementTop < containerElementHeight && elementBottom >= 0;
}

function computeItemScrollIntoView(sectionInstance: SectionInstance, itemInstanceMap: Record<string, ItemInstance>) {
  const sectionBlueprint = sectionBlueprintMap.getById(sectionInstance.id);
  if (!sectionBlueprint) {
    return;
  }
  const containerElementHeight = sectionBlueprintMap.getSectionContainerElementHeight(sectionBlueprint);

  const allDescendantVisibleItems: ItemInstance[] = (sectionInstance.visibleDescendantItemIds || []).map(
    itemId => itemInstanceMap[itemId]
  );

  const selectedItem = allDescendantVisibleItems.find(i => i.isSelected);

  if (selectedItem) {
    if (!isScrolledIntoView(selectedItem.id, containerElementHeight)) {
      selectedItem.shouldScrollIntoView = true;
    }
    return;
  }

  const highlightedItems = allDescendantVisibleItems.filter(i => i.isHighlighted);
  const isAnyHighlightedItemInView = highlightedItems.some(i => isScrolledIntoView(i.id, containerElementHeight));
  if (highlightedItems.length > 0 && !isAnyHighlightedItemInView) {
    highlightedItems[0].shouldScrollIntoView = true;
  }
}

function computeSectionCheckable(
  sectionBlueprint: SectionBlueprint<any>,
  sectionInstance: SectionInstance,
  sectionScope: Record<string, any>
) {
  if (!sectionBlueprint.builder?.makeCheckable || !sectionInstance.visibleDescendantItemIds) {
    sectionInstance.checkable = undefined;
    return;
  }

  const {checkedItemIds, checkItemsActionCreator, uncheckItemsActionCreator} =
    sectionBlueprint.builder.makeCheckable(sectionScope);
  let nrOfCheckedItems = 0;

  sectionInstance.visibleDescendantItemIds.forEach(itemId => {
    if (checkedItemIds.includes(itemId)) {
      nrOfCheckedItems += 1;
    }
  });

  const isChecked =
    nrOfCheckedItems === 0
      ? 'unchecked'
      : nrOfCheckedItems < sectionInstance.visibleDescendantItemIds.length
      ? 'partial'
      : 'checked';

  sectionInstance.checkable = {
    value: isChecked,
    checkItemsAction: checkItemsActionCreator(sectionInstance.visibleDescendantItemIds),
    uncheckItemsAction: uncheckItemsActionCreator(sectionInstance.visibleDescendantItemIds),
  };
}

/**
 * Compute the visibility of each section based on the visibility of it's children
 * Compute the array of all visible descendant sections for each section
 */
function computeSectionVisibility(
  sectionInstance: SectionInstance,
  sectionInstanceMap: Record<string, SectionInstance>,
  sectionBlueprint: SectionBlueprint<any, any>
): [boolean, string[] | undefined, string[] | undefined] {
  let visibleDescendantItemIds: string[] = [];

  if (sectionBlueprint.childSectionIds && sectionBlueprint.childSectionIds.length > 0) {
    const childSectionVisibilityMap: Record<string, boolean> = {};

    sectionBlueprint.childSectionIds.forEach(childSectionId => {
      const childSectionInstance = sectionInstanceMap[childSectionId];
      const [isChildSectionVisible, visibleDescendantSectionIdsOfChildSection, visibleDescendantItemIdsOfChildSection] =
        computeSectionVisibility(childSectionInstance, sectionInstanceMap, sectionBlueprint);

      if (visibleDescendantSectionIdsOfChildSection) {
        if (sectionInstance.visibleDescendantSectionIds) {
          sectionInstance.visibleDescendantSectionIds.push(...visibleDescendantSectionIdsOfChildSection);
        } else {
          sectionInstance.visibleDescendantSectionIds = [...visibleDescendantSectionIdsOfChildSection];
        }
      }

      if (visibleDescendantItemIdsOfChildSection) {
        visibleDescendantItemIds.push(...visibleDescendantItemIdsOfChildSection);
      }

      childSectionVisibilityMap[childSectionId] = isChildSectionVisible;
      if (isChildSectionVisible) {
        if (sectionInstance.visibleChildSectionIds) {
          sectionInstance.visibleChildSectionIds.push(childSectionId);
        } else {
          sectionInstance.visibleChildSectionIds = [childSectionId];
        }
      }
    });

    if (sectionInstance.visibleChildSectionIds) {
      if (sectionInstance.visibleDescendantSectionIds) {
        sectionInstance.visibleDescendantSectionIds.push(...sectionInstance.visibleChildSectionIds);
        sectionInstance.visibleDescendantSectionIds = [...new Set(sectionInstance.visibleDescendantSectionIds)];
      } else {
        sectionInstance.visibleDescendantSectionIds = [...sectionInstance.visibleChildSectionIds];
      }
    }

    sectionInstance.isVisible =
      sectionInstance.isVisible || Object.values(childSectionVisibilityMap).some(isVisible => isVisible === true);
  }

  if (sectionInstance.visibleItemIds) {
    visibleDescendantItemIds.push(...sectionInstance.visibleItemIds);
  }

  sectionInstance.visibleDescendantItemIds = visibleDescendantItemIds;
  return [
    sectionInstance.isVisible,
    sectionInstance.visibleDescendantSectionIds,
    sectionInstance.visibleDescendantItemIds,
  ];
}
/**
 * Build the section and item instances based on the registered section blueprints
 */
const processSectionBlueprints = async (state: RootState, dispatch: AppDispatch) => {
  const sectionInstanceMap: Record<string, SectionInstance> = {};
  const itemInstanceMap: Record<string, ItemInstance> = {};

  const fullScope: Record<string, any> = {};
  const scopeKeysBySectionId: Record<string, string[]> = {};
  const isChangedByScopeKey: Record<string, boolean> = {};

  const sectionBlueprintList = sectionBlueprintMap.getAll();

  // check if anything from the full scope has changed and store the keys of changed values
  await asyncLib.each(sectionBlueprintList, async sectionBlueprint => {
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
    log.debug('fullScope did not change.');
    return;
  }

  await asyncLib.each(sectionBlueprintList, async sectionBlueprint => {
    const sectionScopeKeys: string[] | undefined = scopeKeysBySectionId[sectionBlueprint.id];
    const hasSectionScopeChanged = Object.entries(isChangedByScopeKey).some(
      ([key, value]) => sectionScopeKeys.includes(key) && value === true
    );
    if (!hasSectionScopeChanged) {
      log.debug(`Section ${sectionBlueprint.id} scope did not change`);
      return;
    }
    const sectionScope = pickPartialRecord(fullScope, scopeKeysBySectionId[sectionBlueprint.id]);

    const sectionBuilder = sectionBlueprint.builder;
    const itemBlueprint = sectionBlueprint.itemBlueprint;

    let itemInstances: ItemInstance[] | undefined;
    let rawItems: any[] = [];

    // build the item instances if the section has the itemBlueprint defined
    if (itemBlueprint) {
      rawItems = (sectionBlueprint.builder?.getRawItems && sectionBlueprint.builder.getRawItems(sectionScope)) || [];
      const itemBuilder = itemBlueprint.builder;
      itemInstances = rawItems?.map(rawItem => {
        return {
          name: itemBlueprint.getName(rawItem, sectionScope),
          id: itemBlueprint.getInstanceId(rawItem, sectionScope),
          sectionId: sectionBlueprint.id,
          rootSectionId: sectionBlueprint.rootSectionId,
          isSelected: Boolean(itemBuilder?.isSelected ? itemBuilder.isSelected(rawItem, sectionScope) : false),
          isHighlighted: Boolean(itemBuilder?.isHighlighted ? itemBuilder.isHighlighted(rawItem, sectionScope) : false),
          isVisible: Boolean(itemBuilder?.isVisible ? itemBuilder.isVisible(rawItem, sectionScope) : true),
          isDirty: Boolean(itemBuilder?.isDirty ? itemBuilder.isDirty(rawItem, sectionScope) : false),
          isDisabled: Boolean(itemBuilder?.isDisabled ? itemBuilder.isDisabled(rawItem, sectionScope) : false),
          isCheckable: Boolean(itemBuilder?.isCheckable ? itemBuilder.isCheckable(rawItem, sectionScope) : false),
          isChecked: Boolean(itemBuilder?.isChecked ? itemBuilder.isChecked(rawItem, sectionScope) : false),
          meta: itemBuilder?.getMeta ? itemBuilder.getMeta(rawItem, sectionScope) : undefined,
        };
      });
      itemInstances?.forEach(itemInstance => {
        itemInstanceMap[itemInstance.id] = itemInstance;
      });
    }

    const isSectionSelected = Boolean(itemInstances?.some(i => i.isSelected === true));
    const isSectionHighlighted = Boolean(itemInstances?.some(i => i.isHighlighted === true));
    const isSectionInitialized = Boolean(
      sectionBuilder?.isInitialized ? sectionBuilder.isInitialized(sectionScope, rawItems) : true
    );
    const isSectionEmpty = Boolean(
      sectionBuilder?.isEmpty ? sectionBuilder.isEmpty(sectionScope, rawItems, itemInstances) : false
    );
    const sectionGroups = sectionBuilder?.getGroups ? sectionBuilder.getGroups(sectionScope) : [];
    const sectionInstanceGroups = sectionGroups.map(g => ({
      ...g,
      visibleItemIds: g.itemIds.filter(itemId => itemInstanceMap[itemId].isVisible === true),
    }));
    const visibleItemIds = itemInstances?.filter(i => i.isVisible === true).map(i => i.id) || [];
    const visibleGroupIds = sectionInstanceGroups.filter(g => g.visibleItemIds.length > 0).map(g => g.id);
    const sectionInstance: SectionInstance = {
      id: sectionBlueprint.id,
      rootSectionId: sectionBlueprint.rootSectionId,
      itemIds: itemInstances?.map(i => i.id) || [],
      groups: sectionInstanceGroups,
      isLoading: Boolean(sectionBuilder?.isLoading ? sectionBuilder.isLoading(sectionScope, rawItems) : false),
      isVisible:
        Boolean(sectionBuilder?.shouldBeVisibleBeforeInitialized === true && !isSectionInitialized) ||
        (sectionBlueprint && sectionBlueprint.customization?.emptyDisplay && isSectionEmpty) ||
        (isSectionInitialized &&
          Boolean(sectionBuilder?.isVisible ? sectionBuilder.isVisible(sectionScope, rawItems) : true) &&
          (visibleItemIds.length > 0 || visibleGroupIds.length > 0)),
      isInitialized: isSectionInitialized,
      isSelected: isSectionSelected,
      isHighlighted: isSectionHighlighted,
      isEmpty: isSectionEmpty,
      meta: sectionBuilder?.getMeta ? sectionBuilder.getMeta(sectionScope, rawItems) : undefined,
      shouldExpand: Boolean(
        itemInstances?.some(itemInstance => itemInstance.isVisible && itemInstance.shouldScrollIntoView)
      ),
      visibleItemIds,
      visibleGroupIds,
    };
    sectionInstanceMap[sectionBlueprint.id] = sectionInstance;
  });

  const sectionInstanceRoots = Object.values(sectionInstanceMap).filter(sectionInstance => {
    const sectionBlueprint = sectionBlueprintMap.getById(sectionInstance.id);
    if (!sectionBlueprint) {
      return false;
    }
    return sectionBlueprint.rootSectionId === sectionBlueprint.id;
  });

  await asyncLib.each(sectionInstanceRoots, async sectionInstanceRoot => {
    const sectionBlueprint = sectionBlueprintMap.getById(sectionInstanceRoot.id);
    if (!sectionBlueprint) {
      return;
    }
    computeSectionVisibility(sectionInstanceRoot, sectionInstanceMap, sectionBlueprint);
  });

  // this has to run after the `computeSectionVisibility` because it depends on the `section.visibleDescendantItemIds`
  await asyncLib.each(sectionInstanceRoots, async sectionInstanceRoot =>
    computeItemScrollIntoView(sectionInstanceRoot, itemInstanceMap)
  );

  // this has to run after the `computeSectionVisibility` because it depends on the `section.visibleDescendantItemIds`
  await asyncLib.each(Object.values(sectionInstanceMap), async sectionInstance => {
    const sectionBlueprint = sectionBlueprintMap.getById(sectionInstance.id);
    if (!sectionBlueprint) {
      return;
    }
    const sectionScope = pickPartialRecord(fullScope, scopeKeysBySectionId[sectionBlueprint.id]);
    computeSectionCheckable(sectionBlueprint, sectionInstance, sectionScope);
  });

  if (Object.keys(itemInstanceMap).length === 0 && Object.keys(sectionInstanceMap).length === 0) {
    return;
  }

  const newNavigatorInstanceState: NavigatorInstanceState = {
    sectionInstanceMap,
    itemInstanceMap,
  };

  if (hasNavigatorInstanceStateChanged(state.navigator, newNavigatorInstanceState)) {
    dispatch(updateNavigatorInstanceState(newNavigatorInstanceState));
  }
};

export const sectionBlueprintMiddleware: Middleware = store => next => action => {
  next(action);
  // ignore actions that will not affect any section scope
  if (
    action?.type === updateNavigatorInstanceState.type ||
    action?.type === expandSectionIds.type ||
    action?.type === collapseSectionIds.type
  ) {
    return;
  }
  const state: RootState = store.getState();
  processSectionBlueprints(state, store.dispatch);
};
