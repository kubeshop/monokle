import asyncLib from 'async';
import log from 'loglevel';

import {AppDispatch} from '@models/appdispatch';
import {ItemInstance, NavigatorInstanceState, SectionInstance} from '@models/navigator';
import {RootState} from '@models/rootstate';

import {updateNavigatorInstanceState} from '@redux/reducers/navigator';

import sectionBlueprintMap from '../sectionBlueprintMap';
import {computeSectionCheckable} from './checkable';
import {buildItemInstances} from './itemBuilder';
import {makeNavigatorRows} from './navigatorRows';
import {computeFullScope, hasFullScopeChanged, hasSectionScopeChanged} from './scope';
import {computeItemScrollIntoView} from './scrolling';
import {buildSectionInstance} from './sectionBuilder';
import {pickPartialRecord} from './utils';
import {computeSectionVisibility} from './visibility';

/**
 * Stores the cache of selected key:value pairs from the redux store for all section blueprints.
 * For example, if you have "resourceMap": state.main.resourceMap in your section blueprints' getScope method,
 * the "resourceMap" will be shallow compared only once and then added to the full scope cache.
 * Then, all blueprints that depend on this key will be reprocessed.
 */
const fullScopeCache: Record<string, any> = {};

/**
 * Build the section and item instances based on the registered section blueprints
 */
export const processSectionBlueprints = async (state: RootState, dispatch: AppDispatch) => {
  const previousSectionInstanceMap = state.navigator.sectionInstanceMap;
  const previousItemInstanceMap = state.navigator.itemInstanceMap;

  const sectionInstanceMap: Record<string, SectionInstance> = {};
  const itemInstanceMap: Record<string, ItemInstance> = {};

  const sectionBlueprintList = sectionBlueprintMap.getAll();

  const collapsedSectionIds = state.navigator.collapsedSectionIds;

  const {fullScope, scopeKeysBySectionId, isChangedByScopeKey} = await computeFullScope({
    state,
    sectionBlueprintList,
    fullScopeCache,
  });

  if (!hasFullScopeChanged({isChangedByScopeKey})) {
    return;
  }

  await asyncLib.each(sectionBlueprintList, async sectionBlueprint => {
    const sectionScopeKeys: string[] | undefined = scopeKeysBySectionId[sectionBlueprint.id];
    if (
      previousItemInstanceMap[sectionBlueprint.id] &&
      !hasSectionScopeChanged({
        isChangedByScopeKey,
        sectionScopeKeys,
      }) &&
      sectionScopeKeys.length > 0
    ) {
      log.debug(`Section ${sectionBlueprint.id} scope did not change`);
      const previousSectionInstance = previousSectionInstanceMap[sectionBlueprint.id];
      sectionInstanceMap[sectionBlueprint.id] = previousSectionInstance;
      previousSectionInstance.itemIds.forEach(itemId => {
        itemInstanceMap[itemId] = previousItemInstanceMap[itemId];
      });
      return;
    }

    const sectionScope = pickPartialRecord(fullScope, scopeKeysBySectionId[sectionBlueprint.id]);

    const {itemInstances, rawItems} = buildItemInstances({
      sectionBlueprint,
      sectionScope,
    });

    itemInstances.forEach(itemInstance => {
      itemInstanceMap[itemInstance.id] = itemInstance;
    });

    const sectionInstance = buildSectionInstance({
      sectionBlueprint,
      sectionScope,
      itemInstances,
      rawItems,
      collapsedSectionIds,
    });

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
    rowsByRootSectionId: Object.fromEntries(
      sectionInstanceRoots.map(rootInstance => [rootInstance.id, makeNavigatorRows(rootInstance, sectionInstanceMap)])
    ),
  };

  // if (hasNavigatorInstanceStateChanged(state.navigator, newNavigatorInstanceState)) {
  dispatch(updateNavigatorInstanceState(newNavigatorInstanceState));
  // }
};
