import React, {useMemo} from 'react';
import {ItemCustomComponentProps} from '@models/navigator';
import {K8sResource} from '@models/k8sresource';
import styled from 'styled-components';
import Colors from '@styles/Colors';
import {SwapOutlined, ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';
import {performResourceDiff} from '@redux/thunks/diffResource';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {Tooltip} from 'antd';
import {TOOLTIP_DELAY} from '@constants/constants';
import {ClusterDiffApplyTooltip, ClusterDiffCompareTooltip, ClusterDiffSaveTooltip} from '@constants/tooltips';
import {applyResourceWithConfirm} from '@redux/services/applyResourceWithConfirm';

const Container = styled.div`
  width: 800px;
  display: flex;
  justify-content: space-between;
`;

const Label = styled.span<{disabled?: boolean}>`
  width: 300px;
  ${props => props.disabled && `color: ${Colors.grey800};`}
`;

const IconsContainer = styled.div`
  width: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
`;

function ClusterDiffNameDisplay(props: ItemCustomComponentProps) {
  const {itemInstance} = props;
  const dispatch = useAppDispatch();
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const kubeconfigPath = useAppSelector(state => state.config.kubeconfigPath);

  const {clusterResource, localResources} = (itemInstance.meta || {}) as {
    clusterResource?: K8sResource;
    localResources?: K8sResource[];
  };
  const firstLocalResource = useMemo(() => {
    return localResources && localResources.length > 0 ? localResources[0] : undefined;
  }, [localResources]);

  const onClickDiff = () => {
    if (!firstLocalResource) {
      return;
    }
    dispatch(performResourceDiff(firstLocalResource.id));
  };

  const onClickApply = () => {
    if (!firstLocalResource) {
      return;
    }
    applyResourceWithConfirm(firstLocalResource, resourceMap, fileMap, dispatch, kubeconfigPath);
  };

  if (!clusterResource && !localResources) {
    return null;
  }

  return (
    <Container>
      <Label disabled={!firstLocalResource}>{itemInstance.name}</Label>
      <IconsContainer>
        {firstLocalResource && (
          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={ClusterDiffApplyTooltip}>
            <ArrowRightOutlined onClick={onClickApply} />
          </Tooltip>
        )}
        {clusterResource && firstLocalResource && (
          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={ClusterDiffCompareTooltip}>
            <SwapOutlined onClick={onClickDiff} />
          </Tooltip>
        )}
        {clusterResource && (
          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={ClusterDiffSaveTooltip}>
            <ArrowLeftOutlined />
          </Tooltip>
        )}
      </IconsContainer>
      <Label disabled={!clusterResource}>{itemInstance.name}</Label>
    </Container>
  );
}

export default ClusterDiffNameDisplay;
