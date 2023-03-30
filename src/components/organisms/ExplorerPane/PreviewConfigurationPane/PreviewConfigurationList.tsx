import {useRef} from 'react';

import {size} from 'lodash';
import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';
import {previewConfigurationListSelector} from '@redux/selectors/helmSelectors';

import {Colors} from '@shared/styles/colors';
import {elementScroll, useVirtualizer} from '@tanstack/react-virtual';

import PreviewConfigurationRenderer from './PreviewConfigurationRenderer';

const ROW_HEIGHT = 26;

const PreviewConfigurationList: React.FC = () => {
  const list = useAppSelector(previewConfigurationListSelector);
  const ref = useRef<HTMLUListElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: list.length,
    estimateSize: () => ROW_HEIGHT,
    getScrollElement: () => ref.current,
    scrollToFn: elementScroll,
  });

  if (!size(list)) {
    return <EmptyText>No Preview Configurations found in the current project.</EmptyText>;
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
              {node.type === 'preview-configuration' ? <PreviewConfigurationRenderer id={node.id} /> : null}
            </VirtualItem>
          );
        })}
      </div>
    </ListContainer>
  );
};

export default PreviewConfigurationList;

// Styled Components

const EmptyText = styled.div`
  padding: 0px 14px 0px 16px;
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
