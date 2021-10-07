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
    getGroups,
    useScope,
    itemHandler,
    itemCustomization,
    isLoading,
    isVisible,
    isInitialized,
    subsectionNames,
  } = navSection;

  const scope = useScope();

  const items = useMemo(() => {
    if (getItems) {
      return getItems(scope);
    }
    return [];
  }, [scope, getItems]);

  const groups = useMemo(() => {
    if (getGroups) {
      return getGroups(scope);
    }
    return [];
  }, [scope, getGroups]);

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
  }, [scope, itemHandler, items, getItemIdentifier]);

  const isItemVisible = useCallback(
    (item: ItemType) => {
      const itemId = getItemIdentifier(item);
      if (!itemId) {
        return false;
      }
      return Boolean(itemVisibilityMap[itemId]);
    },
    [itemVisibilityMap, getItemIdentifier]
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
  }, [scope, itemHandler, items, getItemIdentifier]);

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
  }, [scope, itemHandler, items, getItemIdentifier]);

  const isSectionHighlighted = useMemo(() => {
    return (
      !isSectionSelected &&
      Object.values(itemHighlightingMap).length > 0 &&
      Object.values(itemHighlightingMap).some(isHighlighted => isHighlighted === true)
    );
  }, [itemHighlightingMap, isSectionSelected]);

  const isGroupVisible = useCallback(
    (groupName: string) => {
      if (!groups || groups.length === 0) {
        return false;
      }
      const group = groups.find(g => g.groupName === groupName);
      if (!group) {
        return false;
      }
      return group.groupItems.every(item => {
        return isItemVisible(item);
      });
    },
    [groups, isItemVisible]
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
  }, [subsectionNames]);

  const isAnySubsectionVisible = useMemo(() => {
    if (!subsections || subsections.length === 0) {
      return false;
    }
    return subsections.some(s => !hiddenSubsectionNames.includes(s.name));
  }, [subsections, hiddenSubsectionNames]);

  const isSectionInitialized = useMemo(() => {
    if (!isInitialized) {
      return true;
    }
    return isInitialized(scope, items);
  }, [scope, items, isInitialized]);

  const isSectionVisible = useMemo(() => {
    if (!isSectionInitialized) {
      return true;
    }
    const shouldBeVisible = isVisible ? isVisible(scope, items) : true;
    if (shouldBeVisible) {
      return (
        isAnySubsectionVisible ||
        (groups.length > 0 && groups.some(g => g.groupItems.some(i => isItemVisible(i)))) ||
        (items.length > 0 && items.some(i => isItemVisible(i)))
      );
    }
    return false;
  }, [scope, items, groups, isVisible, isAnySubsectionVisible, isItemVisible, isSectionInitialized]);

  return {
    name,
    scope,
    subsections,
    items,
    groups,
    isGroupVisible,
    isItemVisible,
    getItemIdentifier,
    isSectionSelected,
    isSectionHighlighted,
    isSectionLoading,
    isSectionVisible,
    isSectionInitialized,
    itemHandler,
    itemCustomization,
    shouldSectionExpand,
  };
}
