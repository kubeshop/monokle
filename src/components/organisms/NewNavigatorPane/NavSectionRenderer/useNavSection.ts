import {useMemo, useCallback} from 'react';
import {NavSection, NavSectionScopedItemMethod} from '@models/navsection';

function makeItemVisibilityMap<ItemType, ScopeType>(
  items: ItemType[],
  scope: ScopeType,
  isVisible: boolean | NavSectionScopedItemMethod<ItemType, ScopeType, boolean>,
  getItemIdentifier: (item: ItemType) => string | null
): Record<string, boolean> {
  const itemEntries: [string, boolean][] = items
    .map(item => {
      const itemId = getItemIdentifier(item);
      if (!itemId) {
        return undefined;
      }
      const entry: [string, boolean] =
        typeof isVisible === 'boolean' ? [itemId, isVisible] : [itemId, isVisible(item, scope)];
      return entry;
    })
    .filter((entry): entry is [string, boolean] => entry !== undefined);
  return Object.fromEntries(itemEntries);
}

export function useNavSection<ItemType, ScopeType>(navSection: NavSection<ItemType, ScopeType>) {
  const {name, getItems, getItemsGrouped, useScope, itemHandler, itemCustomization, subsections} = navSection;

  const scope = useScope();

  const items = useMemo(() => {
    if (getItems) {
      return getItems(scope);
    }
    return undefined;
  }, [scope, getItems]);

  const groupedItems = useMemo(() => {
    if (getItemsGrouped) {
      return getItemsGrouped(scope);
    }
    return undefined;
  }, [scope, getItemsGrouped]);

  const getItemIdentifier = useCallback(
    (item: ItemType) => {
      if (!itemHandler) {
        return null;
      }
      return itemHandler.getIdentifier(item);
    },
    [itemHandler]
  );

  const itemVisibilityMap = useMemo<Record<string, boolean>>(() => {
    if (!items) {
      return {};
    }
    const isVisible = itemHandler?.isVisible;
    if (!isVisible) {
      return makeItemVisibilityMap(items, scope, true, getItemIdentifier);
    }
    return makeItemVisibilityMap(items, scope, isVisible, getItemIdentifier);
  }, [scope, itemHandler, items]);

  const isItemVisible = useCallback(
    (item: ItemType) => {
      const itemId = getItemIdentifier(item);
      if (!itemId) {
        return false;
      }
      return Boolean(itemVisibilityMap[itemId]);
    },
    [itemVisibilityMap]
  );

  const isGroupVisible = useCallback(
    (groupName: string) => {
      if (!groupedItems || !groupedItems[groupName]) {
        return false;
      }
      return groupedItems[groupName].every(item => {
        return isItemVisible(item);
      });
    },
    [groupedItems, itemVisibilityMap]
  );

  return {
    name,
    scope,
    subsections,
    items,
    groupedItems,
    isGroupVisible,
    isItemVisible,
    getItemIdentifier,
    itemHandler,
    itemCustomization,
  };
}
