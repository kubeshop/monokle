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

import WalkThrough from '@components/molecules/WalkThrough';

const ClusterCompareButton: React.FC = ({children}) => {
  const dispatch = useAppDispatch();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isFolderOpen = useMemo(() => Boolean(fileMap[ROOT_FILE_ENTRY]), [fileMap]);

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
      <WalkThrough placement="leftTop" step="cluster">
        <Button
          onClick={onClickClusterComparison}
          icon={<SwapOutlined />}
          type="primary"
          ghost
          size="small"
          style={{marginLeft: 8}}
          disabled={!isFolderOpen || isInClusterMode}
        >
          {children}
        </Button>
      </WalkThrough>
    </Tooltip>
  );
};

export default ClusterCompareButton;
