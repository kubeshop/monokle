import {
  ItemBlueprint,
  ItemInstance,
  NavigatorItemRow,
  NavigatorRow,
  NavigatorSectionRow,
  RowBuilder,
  SectionBlueprint,
  SectionInstance,
} from '@models/navigator';

import sectionBlueprintMap from '../sectionBlueprintMap';

function buildRowProp<InstanceType>(
  builder: RowBuilder<InstanceType> | undefined,
  propName: keyof RowBuilder<InstanceType>,
  instance: InstanceType,
  defaultValue: number
) {
  let propValue = defaultValue;
  const propBuilder = builder?.[propName];
  if (typeof propBuilder === 'number') {
    propValue = propBuilder;
  } else if (typeof propBuilder === 'function') {
    propValue = propBuilder(instance);
  }
  return propValue;
}

function makeSectionRow(payload: {
  instance: SectionInstance;
  blueprint: SectionBlueprint<any>;
  parentIndentation: number;
  level: number;
}): NavigatorSectionRow {
  const {instance, blueprint, parentIndentation, level} = payload;
  const {rowBuilder} = blueprint;
  const height = buildRowProp(rowBuilder, 'height', instance, 30);
  const fontSize = buildRowProp(rowBuilder, 'fontSize', instance, 30 * 0.75);
  const marginBottom = buildRowProp(rowBuilder, 'marginBottom', instance, 0);
  const indentation = parentIndentation + buildRowProp(rowBuilder, 'indentation', instance, 0);
  return {id: instance.id, type: 'section', level, height, indentation, marginBottom, fontSize};
}

function makeItemRow(payload: {
  instance: ItemInstance;
  blueprint: ItemBlueprint<any, any>;
  sectionId: string;
  parentIndentation: number;
  level: number;
}): NavigatorItemRow {
  const {instance, blueprint, sectionId, parentIndentation, level} = payload;
  const {rowBuilder} = blueprint;
  const height = buildRowProp(rowBuilder, 'height', instance, 30);
  const fontSize = buildRowProp(rowBuilder, 'fontSize', instance, 30 * 0.75);
  const marginBottom = buildRowProp(rowBuilder, 'marginBottom', instance, 0);
  const indentation = parentIndentation + buildRowProp(rowBuilder, 'indentation', instance, 0);
  return {id: instance.id, type: 'item', sectionId, level, height, indentation, marginBottom, fontSize};
}

export function makeNavigatorRows(
  instance: SectionInstance,
  sectionInstanceMap: Record<string, SectionInstance>,
  itemInstanceMap: Record<string, ItemInstance>,
  level = 0,
  parentIndentation = 0
): NavigatorRow[] {
  const rows: NavigatorRow[] = [];
  const blueprint = sectionBlueprintMap.getById(instance.id);

  if (!instance.isVisible || !blueprint) {
    return rows;
  }

  const sectionRow = makeSectionRow({instance, blueprint, parentIndentation, level});
  rows.push(sectionRow);

  const itemBlueprint = blueprint.itemBlueprint;

  if (!instance.isCollapsed && itemBlueprint) {
    rows.push(
      ...instance.visibleItemIds
        .map(itemId => itemInstanceMap[itemId])
        .filter(item => Boolean(item))
        .map(item =>
          makeItemRow({
            instance: item,
            blueprint: itemBlueprint,
            sectionId: blueprint.id,
            parentIndentation,
            level,
          })
        )
    );
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
      rows.push(
        ...makeNavigatorRows(childInstance, sectionInstanceMap, itemInstanceMap, level + 1, sectionRow.indentation)
      );
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
