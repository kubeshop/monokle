import React, {useMemo} from 'react';

import {Button, Popover, Tooltip} from 'antd';

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

import {WalkThrough, WalkThroughTitle, wkContent} from '@components/molecules/WalkThrough';

interface IProps {
  navigatorPaneWidth: number;
}

const ClusterCompareButton: React.FC<IProps> = props => {
  const {navigatorPaneWidth} = props;

  const dispatch = useAppDispatch();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const walkThroughStep = useAppSelector(state => state.ui.walkThrough.currentStep);
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
      <Popover
        placement="leftTop"
        content={<WalkThrough walkThrough={wkContent.stepCluster} />}
        title={<WalkThroughTitle title={wkContent.stepCluster.title} />}
        visible={walkThroughStep === wkContent.stepCluster.currentStep}
        overlayClassName="walkthrough"
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
          {navigatorPaneWidth < 400 ? '' : 'Cluster Compare'}
        </Button>
      </Popover>
    </Tooltip>
  );
};

export default ClusterCompareButton;
