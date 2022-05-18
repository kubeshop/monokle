import React, {useMemo} from 'react';
import {useVirtual} from 'react-virtual';

import {SectionBlueprint, SectionInstance} from '@models/navigator';

import {useAppSelector} from '@redux/hooks';

import sectionBlueprintMap from '@src/navsections/sectionBlueprintMap';

import {ItemRendererOptions} from './ItemRenderer';

type SectionRendererProps = {
  sectionBlueprint: SectionBlueprint<any>;
  level: number;
  isLastSection: boolean;
  parentIndentation?: number;
  itemRendererOptions?: ItemRendererOptions;
  height: number;
};

function flattenSectionsAndItems(instance: SectionInstance, sectionInstanceMap: Record<string, SectionInstance>) {
  const flatItemIds: {id: string; type: 'section' | 'item'}[] = [];
  if (!instance.isVisible) {
    return flatItemIds;
  }
  flatItemIds.push(
    {id: instance.id, type: 'section'},
    ...instance.visibleItemIds.map(id => ({id, type: 'item' as const}))
  );

  const blueprint = sectionBlueprintMap.getById(instance.id);

  if (!blueprint?.childSectionIds) {
    return flatItemIds;
  }

  for (let i = 0; i < blueprint.childSectionIds.length; i += 1) {
    const childBlueprintId = blueprint.childSectionIds[i];
    if (!childBlueprintId) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const childInstance = sectionInstanceMap[childBlueprintId];
    if (childInstance) {
      flatItemIds.push(...flattenSectionsAndItems(childInstance, sectionInstanceMap));
    }
  }

  return flatItemIds;
}

function SectionRenderer(props: SectionRendererProps) {
  const {sectionBlueprint, height} = props;

  const {id: sectionId} = sectionBlueprint;

  const sectionInstance: SectionInstance | undefined = useAppSelector(
    state => state.navigator.sectionInstanceMap[sectionId]
  );

  const sectionInstanceMap = useAppSelector(state => state.navigator.sectionInstanceMap);

  const parentRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;

  const rows = useMemo(() => {
    return sectionInstance ? flattenSectionsAndItems(sectionInstance, sectionInstanceMap) : [];
  }, [sectionInstance, sectionInstanceMap]);

  const rowVirtualizer = useVirtual({
    size: rows.length,
    parentRef,
    estimateSize: React.useCallback(i => (rows[i].type === 'section' ? 50 : 25), [rows]),
    overscan: 5,
  });

  return (
    <div style={{height: `${height}px`, overflow: 'auto'}} ref={parentRef}>
      <div
        style={{
          height: `${rowVirtualizer.totalSize}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.virtualItems.map(virtualRow => {
          const row = rows[virtualRow.index];
          return (
            <div
              key={virtualRow.index}
              ref={virtualRow.measureRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div style={{height: row.type === 'section' ? 50 : 25, textOverflow: 'ellipsis'}} key={row.id}>
                {row.id}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SectionRenderer;
