import React from 'react';
import {useVirtual} from 'react-virtual';

import {NavigatorRow, SectionBlueprint} from '@models/navigator';

import {useAppSelector} from '@redux/hooks';

import {ItemRendererOptions} from './ItemRenderer';

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

  const rows: NavigatorRow[] | undefined = useAppSelector(state => state.navigator.rowsByRootSectionId[sectionId]);

  const parentRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;

  const rowVirtualizer = useVirtual({
    size: rows?.length || 0,
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
