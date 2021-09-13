import {useMemo, useCallback} from 'react';
import {NavSection} from '@models/navsection';

export function useNavSection<ItemType, ScopeType>(navSection: NavSection<ItemType, ScopeType>) {
  const {name, getItems, getItemsGrouped, useScope, itemHandler, subsections} = navSection;

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
      return itemHandler.getIdentifier(item, scope);
    },
    [scope, itemHandler]
  );

  const visibleItems = useMemo(() => {
    if (!items) {
      return [];
    }
    const isVisible = itemHandler?.isVisible;
    if (!isVisible) {
      return items;
    }
    return items.filter(item => isVisible(item, scope));
  }, [scope, itemHandler, items]);

  const groupedVisibleItems = useMemo<Record<string, ItemType[]> | undefined>(() => {
    if (!groupedItems) {
      return undefined;
    }
    const isVisible = itemHandler?.isVisible;
    if (!isVisible) {
      return groupedItems;
    }
    return Object.fromEntries(
      Object.entries(([groupName, groupItems]: [string, ItemType[]]) => {
        return [groupName, groupItems.filter(item => isVisible(item, scope))];
      })
    );
  }, [scope, itemHandler, groupedItems]);

  return {name, scope, subsections, visibleItems, groupedVisibleItems, getItemIdentifier, itemHandler};
}
