import {NavSectionInstance, NavSectionItemInstance} from '@models/navsection';
import store from '@redux/store';
import {shallowEqual} from 'react-redux';
import {updateNavSectionState} from '@redux/reducers/navSection';
import navSectionMap from './navSectionMap';

store.subscribe(() => {
  const state = store.getState();
  const navSectionInstances: NavSectionInstance[] = [];
  const navSectionItemInstances: NavSectionItemInstance[] = [];
  const nextScopeMap: Record<string, Record<string, any>> = {};

  navSectionMap.getAll().forEach(navSection => {
    const previousScope = state.navSection.scopeMap[navSection.id];
    const nextScope = navSection.getScope(state);
    if (shallowEqual(previousScope, nextScope)) {
      return;
    }
    nextScopeMap[navSection.id] = nextScope;
    const itemHandler = navSection.itemHandler;
    let itemInstances: NavSectionItemInstance[] | undefined;
    let rawItems: any[] = [];
    if (itemHandler) {
      rawItems = (navSection.getItems && navSection.getItems(nextScope)) || [];
      itemInstances = rawItems?.map(rawItem => {
        return {
          name: itemHandler.getName(rawItem),
          id: itemHandler.getIdentifier(rawItem),
          isSelected: Boolean(itemHandler.isSelected && itemHandler.isSelected(rawItem, nextScope)),
          isHighlighted: Boolean(itemHandler.isHighlighted && itemHandler.isHighlighted(rawItem, nextScope)),
          isVisible: Boolean(itemHandler.isVisible && itemHandler.isVisible(rawItem, nextScope)),
          isDirty: Boolean(itemHandler.isDirty && itemHandler.isDirty(rawItem, nextScope)),
          isDisabled: Boolean(itemHandler.isDisabled && itemHandler.isDisabled(rawItem, nextScope)),
          shouldScrollIntoView: Boolean(
            itemHandler.shouldScrollIntoView && itemHandler.shouldScrollIntoView(rawItem, nextScope)
          ),
        };
      });
    }
    const navSectionInstance: NavSectionInstance = {
      name: navSection.name,
      subsectionNames: navSection.subsectionNames,
      itemIds: itemInstances?.map(i => i.id),
      isLoading: Boolean(navSection.isLoading && navSection.isLoading(nextScope, rawItems)),
      isVisible: Boolean(navSection.isVisible && navSection.isVisible(nextScope, rawItems)),
      isInitialized: Boolean(navSection.isInitialized && navSection.isInitialized(nextScope, rawItems)),
    };
    navSectionInstances.push(navSectionInstance);
    if (itemInstances) {
      navSectionItemInstances.push(...itemInstances);
    }
  });

  // TODO: compute everything from useNavSection hook

  const updatedNavSectionItemInstances = navSectionItemInstances.filter(nextItemInstance => {
    return !shallowEqual(state.navSection.itemInstanceMap[nextItemInstance.id], nextItemInstance);
  });

  const updatedNavSectionInstances = navSectionInstances.filter(nextSectionInstance => {
    return !shallowEqual(state.navSection.instanceMap[nextSectionInstance.name], nextSectionInstance);
  });

  store.dispatch(
    updateNavSectionState({
      instances: updatedNavSectionInstances,
      itemInstances: updatedNavSectionItemInstances,
      scopeMap: nextScopeMap,
    })
  );
});
