import asyncLib from 'async';
import {isEqual} from 'lodash';

import {ItemInstance, NavigatorInstanceState, SectionBlueprint, SectionInstance} from '@models/navigator';

import {AppListenerFn} from '@redux/listeners/base';
import {updateNavigatorInstanceState, updateSectionInstance} from '@redux/reducers/navigator';

import sectionBlueprintMap from '../sectionBlueprintMap';
import {computeSectionCheckable} from './checkable';
import {buildItemInstances} from './itemBuilder';
import {getRowIndexToScroll, makeNavigatorRows} from './navigatorRows';
import {buildSectionInstance} from './sectionBuilder';
import {computeSectionVisibility} from './visibility';

export const createSectionBlueprintListener = (sectionBlueprint: SectionBlueprint<any>) => {
  const listener: AppListenerFn = startListening => {
    startListening({
      predicate: (action, currentState, originalState) => {
        const currentScope = sectionBlueprint.getScope(currentState);
        const originalScope = sectionBlueprint.getScope(originalState);
        return isEqual(currentScope, originalScope);
      },
      effect: async (action, {dispatch, getState, cancelActiveListeners}) => {
        cancelActiveListeners();
        const state = getState();
        const collapsedSectionIds = state.navigator.collapsedSectionIds;
        const sectionScope = sectionBlueprint.getScope(state);

        const itemInstanceMap: Record<string, ItemInstance> = {};

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

        const lastVisibleItemId = sectionInstance.visibleItemIds.at(-1);
        if (lastVisibleItemId) {
          itemInstanceMap[lastVisibleItemId] = {
            ...itemInstanceMap[lastVisibleItemId],
            isLast: true,
          };
        }

        dispatch(
          updateSectionInstance({
            sectionInstance,
            itemInstanceMap,
          })
        );
      },
    });
  };

  return listener;
};

// this should be created for each Root section
export const createRootSectionListener = (rootSectionId: string) => {
  const listener: AppListenerFn = startListening => {
    startListening({
      predicate: action => {
        // if (action.type === updateSectionInstance.type) {
        //   const sectionInstance: SectionInstance = action.payload.sectionInstance;
        //   return sectionInstance.rootSectionId === rootSectionId;
        // }
        return false;
      },
      effect: async (action, {cancelActiveListeners, dispatch, getState}) => {
        cancelActiveListeners();
        const state = getState();
        const sectionInstanceMap = state.navigator.sectionInstanceMap;
        const itemInstanceMap = state.navigator.itemInstanceMap;
        const rootSectionInstance: SectionInstance | undefined = state.navigator.sectionInstanceMap[rootSectionId];
        if (!rootSectionInstance) {
          return;
        }
        const rootSectionBlueprint = sectionBlueprintMap.getById(rootSectionInstance.id);
        if (!rootSectionBlueprint) {
          return;
        }
        computeSectionVisibility(rootSectionInstance, sectionInstanceMap, rootSectionBlueprint);
        // this has to run after the `computeSectionVisibility` because it depends on the `section.visibleDescendantItemIds`
        await asyncLib.each(Object.values(sectionInstanceMap), async sectionInstance => {
          if (sectionInstance.rootSectionId !== rootSectionId) {
            return;
          }
          const sectionBlueprint = sectionBlueprintMap.getById(sectionInstance.id);
          if (!sectionBlueprint) {
            return;
          }
          const sectionScope = sectionBlueprint.getScope(state);
          computeSectionCheckable(sectionBlueprint, sectionInstance, sectionScope);
        });

        const navigatorRows = makeNavigatorRows(rootSectionInstance, sectionInstanceMap, itemInstanceMap);

        const rowIndexToScroll = getRowIndexToScroll({rows: navigatorRows, itemInstanceMap});

        const newNavigatorInstanceState: NavigatorInstanceState = {
          sectionInstanceMap,
          itemInstanceMap,
          rowsByRootSectionId: {
            [rootSectionInstance.id]: navigatorRows,
          },
          rowIndexToScrollByRootSectionId: {
            [rootSectionInstance.id]: rowIndexToScroll,
          },
        };

        dispatch(updateNavigatorInstanceState(newNavigatorInstanceState));
      },
    });
  };
  return listener;
};
