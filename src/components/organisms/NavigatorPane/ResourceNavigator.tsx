import {useRef} from 'react';

import {Skeleton} from 'antd';

import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';
import {resourceNavigatorSelector} from '@redux/selectors/resourceSelectors';

import {elementScroll, useVirtualizer} from '@tanstack/react-virtual';

import KindRenderer from './KindRenderer';
import ResourceRenderer from './ResourceRenderer';

function ResourceNavigator() {
  const list = useAppSelector(resourceNavigatorSelector);
  const ref = useRef<HTMLUListElement>(null);
  const isLoading = useAppSelector(
    state =>
      state.ui.isFolderLoading || state.main.previewOptions.isLoading || state.main.clusterConnectionOptions.isLoading
  );

  const rowVirtualizer = useVirtualizer({
    count: list.length,
    estimateSize: () => 28,
    getScrollElement: () => ref.current,
    scrollToFn: elementScroll,
  });

  if (isLoading) {
    return (
      <div style={{padding: '10px'}}>
        <Skeleton />
      </div>
    );
  }

  return (
    <ListContainer ref={ref}>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualItem => {
          const node = list[virtualItem.index];

          if (!node) return;

          return (
            <VirtualItem
              key={virtualItem.key}
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {node.type === 'kind' ? (
                <KindRenderer kind={node.name} />
              ) : (
                <ResourceRenderer resourceIdentifier={node.identifier} />
              )}
            </VirtualItem>
          );
        })}
      </div>
    </ListContainer>
  );
}

export default ResourceNavigator;

const VirtualItem = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
`;

const ListContainer = styled.ul`
  height: 100%;
  overflow-y: auto;
  padding: 0 0 12px;
`;
