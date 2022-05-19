import {ItemInstance, SectionInstance} from '@models/navigator';

import sectionBlueprintMap from '../sectionBlueprintMap';

export function isScrolledIntoView(elementId: string, containerElementHeight: number) {
  const element = document.getElementById(elementId);
  const boundingClientRect = element?.getBoundingClientRect();
  if (!boundingClientRect) {
    return false;
  }
  const elementTop = boundingClientRect.top;
  const elementBottom = boundingClientRect.bottom;
  return elementTop < containerElementHeight && elementBottom >= 0;
}

export function computeItemScrollIntoView(
  sectionInstance: SectionInstance,
  itemInstanceMap: Record<string, ItemInstance>
) {
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
