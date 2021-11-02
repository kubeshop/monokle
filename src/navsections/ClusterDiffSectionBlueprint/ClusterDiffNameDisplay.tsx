import React, {useMemo} from 'react';
import {ItemCustomComponentProps} from '@models/navigator';
import {K8sResource} from '@models/k8sresource';
import styled from 'styled-components';
import Colors from '@styles/Colors';
import {SwapOutlined, ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';

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
  const {clusterResource, localResources} = (itemInstance.meta || {}) as {
    clusterResource?: K8sResource;
    localResources?: K8sResource[];
  };
  const firstLocalResource = useMemo(() => {
    return localResources && localResources.length > 0 ? localResources[0] : undefined;
  }, [localResources]);
  if (!clusterResource && !localResources) {
    return null;
  }
  return (
    <Container>
      <Label disabled={!clusterResource}>{itemInstance.name}</Label>
      <IconsContainer>
        <ArrowRightOutlined />
        <SwapOutlined />
        <ArrowLeftOutlined />
      </IconsContainer>
      <Label disabled={!firstLocalResource}>{itemInstance.name}</Label>
    </Container>
  );
}

export default ClusterDiffNameDisplay;
