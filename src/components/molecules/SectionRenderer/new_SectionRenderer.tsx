import React, {useMemo} from 'react';
import {useVirtual} from 'react-virtual';

import {NavigatorRow, SectionBlueprint} from '@models/navigator';

import {useAppSelector} from '@redux/hooks';

import ItemRenderer, {ItemRendererOptions} from './ItemRenderer';
import SectionHeader from './SectionHeader';

type SectionRendererProps = {
  sectionBlueprint: SectionBlueprint<any>;
  level: number;
  isLastSection: boolean;
  parentIndentation?: number;
  itemRendererOptions?: ItemRendererOptions;
  height: number;
};

function SectionRenderer(props: SectionRendererProps) {
  const {sectionBlueprint, height} = props;

  const {id: sectionId} = sectionBlueprint;

  const itemRowHeight = useMemo(
    () => sectionBlueprint.itemBlueprint?.rowHeight,
    [sectionBlueprint.itemBlueprint?.rowHeight]
  );

  const rows: NavigatorRow[] | undefined = useAppSelector(state => state.navigator.rowsByRootSectionId[sectionId]);

  const parentRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;

  const rowVirtualizer = useVirtual({
    size: rows?.length || 0,
    parentRef,
    estimateSize: React.useCallback(
      i => (rows[i].type === 'section' ? sectionBlueprint.rowHeight || 50 : itemRowHeight || 25),
      [rows, sectionBlueprint.rowHeight, itemRowHeight]
    ),
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
              {row.type === 'section' ? (
                <SectionHeader
                  sectionId={row.id}
                  isCollapsed={false}
                  isLastSection={false}
                  expandSection={() => {}}
                  collapseSection={() => {}}
                />
              ) : (
                <ItemRenderer
                  itemId={row.id}
                  sectionId={row.sectionId}
                  level={row.level}
                  isLastItem={false}
                  isSectionCheckable={false}
                  sectionContainerElementId=""
                  indentation={0}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SectionRenderer;
