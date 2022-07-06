import React, {useLayoutEffect, useState} from 'react';
import {useVirtual} from 'react-virtual';

import {NavigatorRow, SectionBlueprint, SectionInstance} from '@models/navigator';

import {useAppSelector} from '@redux/hooks';

import ItemRenderer from './ItemRenderer';
import SectionHeader from './SectionHeader';
import {useSectionCustomization} from './useSectionCustomization';

import * as S from './styled';

type SectionRendererProps = {
  sectionBlueprint: SectionBlueprint<any>;
  parentIndentation?: number;
  height: number;
};

function SectionRenderer(props: SectionRendererProps) {
  const {sectionBlueprint, height} = props;

  const {id: sectionId} = sectionBlueprint;

  const [lastScrollIndex, setLastScrollIndex] = useState<number>(-1);

  const rootSectionInstance: SectionInstance | undefined = useAppSelector(
    state => state.navigator.sectionInstanceMap[sectionId]
  );

  const {customEmpty} = useSectionCustomization(sectionBlueprint.customization);

  const rows: NavigatorRow[] | undefined = useAppSelector(state => state.navigator.rowsByRootSectionId[sectionId]);
  const rowIndexToScroll = useAppSelector(
    state => state.navigator.rowIndexToScrollByRootSectionId[sectionBlueprint.id]
  );

  const parentRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;

  const {virtualItems, scrollToIndex, totalSize} = useVirtual({
    size: rows?.length || 0,
    parentRef,
    estimateSize: React.useCallback((i: number) => rows[i].height + rows[i].marginBottom, [rows]),
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
    // we need to set the last index that we scrolled to so we don't end up scrolling to the row unintentionally
    setLastScrollIndex(rowIndexToScroll || -1);
    // disabled the below eslint rule because it was causing too many re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowIndexToScroll, virtualItems, lastScrollIndex]);

  if (!rootSectionInstance?.isInitialized && sectionBlueprint.customization?.row?.initializationText) {
    return (
      <S.BeforeInitializationContainer>
        <p>{sectionBlueprint.customization.row.initializationText}</p>
      </S.BeforeInitializationContainer>
    );
  }

  if (!rootSectionInstance?.isVisible) {
    return null;
  }

  if (rootSectionInstance?.isLoading) {
    return <S.Skeleton />;
  }

  if (rootSectionInstance?.isEmpty) {
    if (customEmpty?.Component) {
      return (
        <S.EmptyDisplayContainer>
          <customEmpty.Component sectionInstance={rootSectionInstance} />
        </S.EmptyDisplayContainer>
      );
    }
    return (
      <S.EmptyDisplayContainer>
        <h1>{rootSectionInstance.name}</h1>
        <p>Section is empty.</p>
      </S.EmptyDisplayContainer>
    );
  }

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
                // this has to be defined inline because of the virtualization
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {row.type === 'section' ? <SectionHeader sectionRow={row} /> : <ItemRenderer itemRow={row} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SectionRenderer;
