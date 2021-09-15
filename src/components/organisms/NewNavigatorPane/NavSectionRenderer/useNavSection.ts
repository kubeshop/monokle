import {useMemo, useCallback} from 'react';
import {NavSection} from '@models/navsection';
import navSectionMap from '@src/navsections/navSectionMap';

function makeItemVisibilityMap<ItemType, ScopeType>(
  items: ItemType[],
  scope: ScopeType,
  isVisible: boolean | ((item: ItemType, scope: ScopeType) => boolean),
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
  const {
    name,
    getItems,
    getItemsGrouped,
    useScope,
    itemHandler,
    itemCustomization,
    isLoading,
    isVisible,
    subsectionNames,
  } = navSection;

  const scope = useScope();

  const items = useMemo(() => {
    if (getItems) {
      return getItems(scope);
    }
    return [];
  }, [scope, getItems]);

  const groupedItems = useMemo(() => {
    if (getItemsGrouped) {
      return getItemsGrouped(scope);
    }
    return {};
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
    const handleIsVisible = itemHandler?.isVisible;
    if (!handleIsVisible) {
      return makeItemVisibilityMap(items, scope, true, getItemIdentifier);
    }
    return makeItemVisibilityMap(items, scope, handleIsVisible, getItemIdentifier);
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

  const isSectionLoading = useMemo(() => {
    if (!isLoading) {
      return false;
    }
    return isLoading(scope, items);
  }, [scope, items, isLoading]);

  const isSectionVisible = useMemo(() => {
    if (!isVisible) {
      return true;
    }
    return isVisible(scope, items);
  }, [scope, items, isVisible]);

  const subsections = useMemo(() => {
    return subsectionNames?.map(s => navSectionMap.getByName(s)) || undefined;
  }, [navSectionMap]);

  return {
    name,
    scope,
    subsections,
    items,
    groupedItems,
    isGroupVisible,
    isItemVisible,
    getItemIdentifier,
    isSectionLoading,
    isSectionVisible,
    itemHandler,
    itemCustomization,
  };
}
