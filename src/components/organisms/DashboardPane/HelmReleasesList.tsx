import {useRef} from 'react';

import {Typography} from 'antd';

import styled, {css} from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setSelectedHelmRelease} from '@redux/reducers/ui';

import {HelmRelease} from '@shared/models/ui';
import {Colors} from '@shared/styles';
import {elementScroll, useVirtualizer} from '@tanstack/react-virtual';

const ROW_HEIGHT = 40;

const HelmReleasesList = ({list}: {list: HelmRelease[]}) => {
  const dispatch = useAppDispatch();
  const selectedHelmRelease = useAppSelector(state => state.ui.helmPane.selectedHelmRelease);

  const ref = useRef<HTMLUListElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: list.length,
    estimateSize: () => ROW_HEIGHT,
    getScrollElement: () => ref.current,
    scrollToFn: elementScroll,
  });

  const onItemClick = (chart: HelmRelease) => {
    dispatch(setSelectedHelmRelease(chart));
  };

  return list.length === 0 ? (
    <div style={{marginTop: 16}}>
      <Typography.Text type="secondary">No Helm releases found</Typography.Text>
    </div>
  ) : (
    <div style={{marginTop: 16}}>
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
              $active={node.name === selectedHelmRelease?.name}
              key={virtualItem.key}
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
              onClick={() => onItemClick(node)}
            >
              <Typography.Text>{node.name}</Typography.Text>
            </VirtualItem>
          );
        })}
      </div>
    </div>
  );
};

export default HelmReleasesList;

const VirtualItem = styled.div<{$active: boolean}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
  cursor: pointer;
  padding: 0 0 0 16px;

  font-size: 14px;
  line-height: 36px;

  color: ${Colors.grey9};

  :hover {
    background: ${Colors.blackPearl};
    .ant-typography {
      font-weight: 700;
      color: ${$active => ($active ? Colors.whitePure : 'currentColor')};
    }
  }

  ${props => {
    if (props.$active) {
      return css`
        background: ${Colors.selectionColor};

        .ant-typography {
          font-weight: 700;
          color: ${Colors.blackPure};
        }
      `;
    }
  }};
`;
