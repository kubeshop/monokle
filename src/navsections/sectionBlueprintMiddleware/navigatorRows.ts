import {ItemInstance, NavigatorRow, SectionInstance} from '@models/navigator';

export function makeNavigatorRows(
  instance: SectionInstance,
  sectionInstanceMap: Record<string, SectionInstance>,
  level = 0
): NavigatorRow[] {
  const rows: NavigatorRow[] = [];
  if (!instance.isVisible) {
    return rows;
  }

  rows.push({id: instance.id, type: 'section', level});

  if (!instance.isCollapsed) {
    rows.push(...instance.visibleItemIds.map(id => ({id, type: 'item' as const, level, sectionId: instance.id})));
  }

  if (!instance?.visibleChildSectionIds) {
    return rows;
  }

  for (let i = 0; i < instance.visibleChildSectionIds.length; i += 1) {
    const childSectionId = instance.visibleChildSectionIds[i];
    if (!childSectionId) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const childInstance = sectionInstanceMap[childSectionId];
    if (childInstance) {
      rows.push(...makeNavigatorRows(childInstance, sectionInstanceMap, level + 1));
    }
  }

  return rows;
}

type GetRowIndexToScrollProps = {
  itemInstanceMap: Record<string, ItemInstance>;
  rows: NavigatorRow[];
};
export function getRowIndexToScroll(props: GetRowIndexToScrollProps): number | undefined {
  const {itemInstanceMap, rows} = props;

  let selectedItemIndex: number = -1;
  let firstHighlightedItemIndex: number = -1;
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (row.type === 'item') {
      const item = itemInstanceMap[row.id];
      if (item?.isSelected && selectedItemIndex === -1) {
        selectedItemIndex = i;
      }
      if (item?.isHighlighted && firstHighlightedItemIndex === -1) {
        firstHighlightedItemIndex = i;
      }
    }
  }

  if (selectedItemIndex !== -1) {
    return selectedItemIndex;
  }

  if (firstHighlightedItemIndex !== -1) {
    return firstHighlightedItemIndex;
  }

  return undefined;
}
