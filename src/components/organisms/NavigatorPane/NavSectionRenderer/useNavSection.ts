import {useMemo, useCallback} from 'react';
import {NavSection} from '@models/navsection';
import navSectionMap from '@src/navsections/navSectionMap';

function makeItemToPassedConditionMap<ItemType, ScopeType>(
  items: ItemType[],
  scope: ScopeType,
  isPassingCondition: boolean | ((item: ItemType, scope: ScopeType) => boolean),
  getItemIdentifier: (item: ItemType) => string | null
): Record<string, boolean> {
  const itemEntries: [string, boolean][] = items
    .map(item => {
      const itemId = getItemIdentifier(item);
      if (!itemId) {
        return undefined;
      }
      const entry: [string, boolean] =
        typeof isPassingCondition === 'boolean'
          ? [itemId, isPassingCondition]
          : [itemId, isPassingCondition(item, scope)];
      return entry;
    })
    .filter((entry): entry is [string, boolean] => entry !== undefined);
  return Object.fromEntries(itemEntries);
}

export function useNavSection<ItemType, ScopeType>(
  navSection: NavSection<ItemType, ScopeType>,
  hiddenSubsectionNames: string[]
) {
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
      return makeItemToPassedConditionMap(items, scope, true, getItemIdentifier);
    }
    return makeItemToPassedConditionMap(items, scope, handleIsVisible, getItemIdentifier);
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

  const itemSelectionMap = useMemo<Record<string, boolean>>(() => {
    if (!items) {
      return {};
    }
    const handleIsSelected = itemHandler?.isSelected;
    if (!handleIsSelected) {
      return makeItemToPassedConditionMap(items, scope, false, getItemIdentifier);
    }
    return makeItemToPassedConditionMap(items, scope, handleIsSelected, getItemIdentifier);
  }, [scope, itemHandler, items]);

  const isSectionSelected = useMemo(() => {
    return (
      Object.values(itemSelectionMap).length > 0 &&
      Object.values(itemSelectionMap).some(isSelected => isSelected === true)
    );
  }, [itemSelectionMap]);

  const itemHighlightingMap = useMemo<Record<string, boolean>>(() => {
    if (!items) {
      return {};
    }
    const handleIsHighlighted = itemHandler?.isHighlighted;
    if (!handleIsHighlighted) {
      return makeItemToPassedConditionMap(items, scope, false, getItemIdentifier);
    }
    return makeItemToPassedConditionMap(items, scope, handleIsHighlighted, getItemIdentifier);
  }, [scope, itemHandler, items]);

  const isSectionHighlighted = useMemo(() => {
    return (
      !isSectionSelected &&
      Object.values(itemHighlightingMap).length > 0 &&
      Object.values(itemHighlightingMap).some(isHighlighted => isHighlighted === true)
    );
  }, [itemHighlightingMap, isSectionSelected]);

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

  const shouldSectionExpand = useMemo(() => {
    const shouldScrollItemIntoView = itemHandler?.shouldScrollIntoView;
    if (items && shouldScrollItemIntoView) {
      if (items.some(item => isItemVisible(item) && shouldScrollItemIntoView(item, scope))) {
        return true;
      }
    }
    return false;
  }, [scope, items, itemHandler, isItemVisible]);

  const isSectionLoading = useMemo(() => {
    if (!isLoading) {
      return false;
    }
    return isLoading(scope, items);
  }, [scope, items, isLoading]);

  const subsections = useMemo(() => {
    return subsectionNames?.map(s => navSectionMap.getByName(s)) || undefined;
  }, [navSectionMap]);

  const isAnySubsectionVisible = useMemo(() => {
    if (!subsections || subsections.length === 0) {
      return false;
    }
    return subsections.some(s => !hiddenSubsectionNames.includes(s.name));
  }, [subsections, hiddenSubsectionNames]);

  const isSectionVisible = useMemo(() => {
    const shouldBeVisible = isVisible ? isVisible(scope, items) : true;
    if (shouldBeVisible) {
      return (
        isAnySubsectionVisible ||
        (Object.keys(groupedItems).length > 0 &&
          Object.values(groupedItems).some(g => g.some(i => isItemVisible(i)))) ||
        (items.length > 0 && items.some(i => isItemVisible(i)))
      );
    }
    return false;
  }, [scope, items, groupedItems, isVisible, isAnySubsectionVisible]);

  return {
    name,
    scope,
    subsections,
    items,
    groupedItems,
    isGroupVisible,
    isItemVisible,
    getItemIdentifier,
    isSectionSelected,
    isSectionHighlighted,
    isSectionLoading,
    isSectionVisible,
    itemHandler,
    itemCustomization,
    shouldSectionExpand,
  };
}
