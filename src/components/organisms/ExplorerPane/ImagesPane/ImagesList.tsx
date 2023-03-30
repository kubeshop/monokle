import {useRef} from 'react';

import {size} from 'lodash';
import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';
import {imageListSelector} from '@redux/selectors/imageSelectors';

import {Colors} from '@shared/styles/colors';
import {elementScroll, useVirtualizer} from '@tanstack/react-virtual';

import ImageRenderer from './ImageRenderer/ImageRenderer';
import {useScroll} from './useScroll';

const ROW_HEIGHT = 23;

const ImagesList: React.FC = () => {
  const list = useAppSelector(imageListSelector);
  const ref = useRef<HTMLUListElement>(null);

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

  if (!size(list)) {
    return <EmptyText>No images were found in the current project.</EmptyText>;
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
            >
              {node.type === 'image' ? <ImageRenderer id={node.id} /> : null}
            </VirtualItem>
          );
        })}
      </div>
    </ListContainer>
  );
};

export default ImagesList;

// Styled Components

const EmptyText = styled.div`
  padding: 16px;
  color: ${Colors.grey8};
`;

const ListContainer = styled.ul`
  height: 100%;
  overflow-y: auto;
  padding: 0px;
  margin-top: 15px;
`;

const VirtualItem = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
`;
