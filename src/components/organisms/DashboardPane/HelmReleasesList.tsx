import {useRef} from 'react';

import {Typography} from 'antd';

import {setSelectedHelmRelease} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLeftMenuSelection} from '@redux/reducers/ui';

import {HelmRelease} from '@shared/models/ui';
import {trackEvent} from '@shared/utils';
import {elementScroll, useVirtualizer} from '@tanstack/react-virtual';

import * as S from './DashboardPane.style';

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
    trackEvent('helm_release/select');
  };

  const onBrowseHelmClickHandler = () => {
    dispatch(setSelectedHelmRelease(null));
    dispatch(setLeftMenuSelection('helm'));
    trackEvent('helm_release/navigate_to_helm_repo');
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
    <S.ListContainer style={{marginTop: 16}} ref={ref}>
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
            <S.VirtualItem
              $active={node.chart === selectedHelmRelease?.chart && node.name === selectedHelmRelease?.name}
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
            </S.VirtualItem>
          );
        })}
      </div>
    </S.ListContainer>
  );
};

export default HelmReleasesList;
