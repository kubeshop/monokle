import React, {useMemo} from 'react';

import {Button, Tooltip} from 'antd';

import {SwapOutlined} from '@ant-design/icons';

import {ROOT_FILE_ENTRY, TOOLTIP_DELAY} from '@constants/constants';
import {
  ClusterDiffDisabledInClusterPreviewTooltip,
  ClusterDiffDisabledTooltip,
  ClusterDiffTooltip,
} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openClusterDiff} from '@redux/reducers/ui';
import {isInClusterModeSelector} from '@redux/selectors';

import {useWindowSize} from '@utils/hooks';

function ClusterCompareButton() {
  const dispatch = useAppDispatch();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const navWidth = useAppSelector(state => state.ui.paneConfiguration.navWidth);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const windowSize = useWindowSize();

  const isFolderOpen = useMemo(() => {
    return Boolean(fileMap[ROOT_FILE_ENTRY]);
  }, [fileMap]);

  const onClickClusterComparison = () => {
    dispatch(openClusterDiff());
  };

  const shouldHideClusterCompareText = useMemo(() => {
    return windowSize.width * Number(navWidth.toFixed(2)) < 350;
  }, [navWidth, windowSize.width]);

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
        {shouldHideClusterCompareText ? '' : 'Cluster Compare'}
      </Button>
    </Tooltip>
  );
}

export default ClusterCompareButton;
