import {Button, Tooltip} from 'antd';
import React, {useMemo} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openClusterDiff} from '@redux/reducers/ui';
import {isInClusterModeSelector} from '@redux/selectors';

import {SwapOutlined} from '@ant-design/icons';

import {ROOT_FILE_ENTRY, TOOLTIP_DELAY} from '@constants/constants';
import {
  ClusterDiffDisabledInClusterPreviewTooltip,
  ClusterDiffDisabledTooltip,
  ClusterDiffTooltip,
} from '@constants/tooltips';

function ClusterComparisonButton() {
  const dispatch = useAppDispatch();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const navWidth = useAppSelector(state => state.ui.paneConfiguration.navWidth);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);

  const isFolderOpen = useMemo(() => {
    return Boolean(fileMap[ROOT_FILE_ENTRY]);
  }, [fileMap]);

  const onClickClusterComparison = () => {
    dispatch(openClusterDiff());
  };

  return (
    <Tooltip
      mouseEnterDelay={isFolderOpen ? TOOLTIP_DELAY : 0}
      title={
        !isFolderOpen
          ? ClusterDiffDisabledTooltip
          : isInClusterMode
          ? ClusterDiffDisabledInClusterPreviewTooltip
          : ClusterDiffTooltip
      }
      placement="bottom"
    >
      <Button
        onClick={onClickClusterComparison}
        icon={<SwapOutlined />}
        type="primary"
        ghost
        size="small"
        style={{marginLeft: 8}}
        disabled={!isFolderOpen || isInClusterMode}
      >
        {Number(navWidth.toFixed(2)) < 0.3 ? '' : 'Cluster Compare'}
      </Button>
    </Tooltip>
  );
}

export default ClusterComparisonButton;
