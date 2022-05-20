import {NavigatorRow, SectionInstance} from '@models/navigator';

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
