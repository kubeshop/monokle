import React, {useLayoutEffect, useMemo, useState} from 'react';
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

  const [lastScrollIndex, setLastScrollIndex] = useState<number>(-1);

  const itemRowHeight = useMemo(
    () => sectionBlueprint.itemBlueprint?.rowHeight,
    [sectionBlueprint.itemBlueprint?.rowHeight]
  );

  const rows: NavigatorRow[] | undefined = useAppSelector(state => state.navigator.rowsByRootSectionId[sectionId]);
  const rowIndexToScroll = useAppSelector(
    state => state.navigator.rowIndexToScrollByRootSectionId[sectionBlueprint.id]
  );

  const parentRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;

  // TODO: we need to compute the rowHeight in the middleware, based on child section blueprints
  const {virtualItems, scrollToIndex, totalSize} = useVirtual({
    size: rows?.length || 0,
    parentRef,
    estimateSize: React.useCallback(
      i => (rows[i].type === 'section' ? sectionBlueprint.rowHeight || 50 : itemRowHeight || 25),
      [rows, sectionBlueprint.rowHeight, itemRowHeight]
    ),
    overscan: 5,
  });

  useLayoutEffect(() => {
    if (
      rowIndexToScroll &&
      rowIndexToScroll !== lastScrollIndex &&
      !virtualItems.some(item => item.index === rowIndexToScroll)
    ) {
      scrollToIndex(rowIndexToScroll, {align: 'center'});
    }
    setLastScrollIndex(rowIndexToScroll || -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowIndexToScroll, virtualItems, lastScrollIndex]);

  return (
    <div style={{height: `${height}px`, overflow: 'auto'}} ref={parentRef}>
      <div
        style={{
          height: `${totalSize}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map(virtualRow => {
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
                <SectionHeader sectionId={row.id} isLastSection={false} />
              ) : (
                <ItemRenderer
                  itemId={row.id}
                  sectionId={row.sectionId}
                  level={row.level}
                  isLastItem={false}
                  isSectionCheckable={false}
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
