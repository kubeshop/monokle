import {useRef} from 'react';

import {Skeleton} from 'antd';

import {size} from 'lodash';
import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';
import {helmChartListSelector} from '@redux/selectors/helmSelectors';

import {Colors} from '@shared/styles/colors';
import {elementScroll, useVirtualizer} from '@tanstack/react-virtual';

import {useScroll} from './useScroll';

const ROW_HEIGHT = 26;

const HelmList: React.FC = () => {
  const list = useAppSelector(helmChartListSelector);
  const ref = useRef<HTMLUListElement>(null);
  const isLoading = useAppSelector(state => state.ui.isFolderLoading);

  const rowVirtualizer = useVirtualizer({
    count: list.length,
    estimateSize: () => ROW_HEIGHT,
    getScrollElement: () => ref.current,
    scrollToFn: elementScroll,
  });

  useScroll({
    list,
    scrollTo: index =>
      rowVirtualizer.scrollToIndex(index, {
        align: 'center',
        behavior: 'smooth',
      }),
  });

  if (isLoading) {
    return (
      <div style={{padding: '16px'}}>
        <Skeleton active />
      </div>
    );
  }

  if (!size(list)) {
    return <EmptyText>No Helm Charts found in the current project.</EmptyText>;
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

          if (!node) {
            return null;
          }

          return (
            <VirtualItem
              key={virtualItem.key}
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            />
          );
        })}
      </div>
    </ListContainer>
  );
};

export default HelmList;

// Styled Components

const EmptyText = styled.div`
  padding: 16px;
  color: ${Colors.grey8};
`;

const ListContainer = styled.ul`
  height: 100%;
  overflow-y: auto;
  padding: 0px 0px 12px;
`;

const VirtualItem = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
`;
