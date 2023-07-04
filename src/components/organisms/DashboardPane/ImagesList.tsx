import {useRef} from 'react';

import {Typography} from 'antd';

import {size} from 'lodash';
import styled from 'styled-components';

import {setSelectedImage} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {imageListSelector} from '@redux/selectors/imageSelectors';

import {ImageType} from '@shared/models/image';
import {Colors} from '@shared/styles/colors';
import {trackEvent} from '@shared/utils';
import {elementScroll, useVirtualizer} from '@tanstack/react-virtual';

import * as S from './DashboardPane.style';

const ROW_HEIGHT = 32;

const ImagesList: React.FC = () => {
  const dispatch = useAppDispatch();
  const list = useAppSelector(imageListSelector);
  const imagesMap = useAppSelector(state => state.main.imageMap);
  const selectedImage = useAppSelector(state => state.dashboard.selectedImage);

  const ref = useRef<HTMLUListElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: list.length,
    estimateSize: () => ROW_HEIGHT,
    getScrollElement: () => ref.current,
    scrollToFn: elementScroll,
  });

  const onItemClick = (image: ImageType) => {
    dispatch(setSelectedImage(image));
    trackEvent('image_resources/select');
  };

  if (!size(list)) {
    return <EmptyText>No images were found in the current project.</EmptyText>;
  }

  return (
    <S.ListContainer ref={ref}>
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
          const image = imagesMap[node.id];

          return (
            <S.VirtualItem
              $active={selectedImage?.id === image.id}
              key={virtualItem.key}
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
              onClick={() => onItemClick(image)}
            >
              <Typography.Text>{image.name}</Typography.Text>
            </S.VirtualItem>
          );
        })}
      </div>
    </S.ListContainer>
  );
};

export default ImagesList;

// Styled Components

const EmptyText = styled.div`
  padding: 16px;
  color: ${Colors.grey8};
`;
