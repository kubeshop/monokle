import {useRef} from 'react';

import {Typography} from 'antd';

import styled, {css} from 'styled-components';

import {setSelectedHelmRelease} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLeftMenuSelection} from '@redux/reducers/ui';

import {HelmRelease} from '@shared/models/ui';
import {Colors} from '@shared/styles';
import {elementScroll, useVirtualizer} from '@tanstack/react-virtual';

const ROW_HEIGHT = 40;

const HelmReleasesList = ({list}: {list: HelmRelease[]}) => {
  const dispatch = useAppDispatch();
  const selectedHelmRelease = useAppSelector(state => state.dashboard.helm.selectedHelmRelease);

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

  const onBrowseHelmClickHandler = () => {
    dispatch(setSelectedHelmRelease(null));
    dispatch(setLeftMenuSelection('helm'));
  };

  return list.length === 0 ? (
    <div style={{marginTop: 16}}>
      <Typography.Text type="secondary">
        No Helm releases found - try the{' '}
        <Typography.Link onClick={onBrowseHelmClickHandler}>[Helm Repository Browser]</Typography.Link> to find a chart
        to install
      </Typography.Text>
    </div>
  ) : (
    <ListContainer style={{marginTop: 16}} ref={ref}>
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
              $active={node.chart === selectedHelmRelease?.chart}
              key={virtualItem.key}
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
              onClick={() => onItemClick(node)}
            >
              <Typography.Text>
                {node.name}/{node.chart}
              </Typography.Text>
            </VirtualItem>
          );
        })}
      </div>
    </ListContainer>
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

const ListContainer = styled.ul`
  height: 100%;
  overflow-y: auto;
  padding: 0px 0px;
`;
