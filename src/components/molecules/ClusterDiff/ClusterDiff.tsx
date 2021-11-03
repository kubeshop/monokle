import React, {useContext} from 'react';
import {MonoPaneTitle} from '@components/atoms';
import HelmChartSectionBlueprint, {HelmChartScopeType} from '@src/navsections/HelmChartSectionBlueprint';
import KustomizationSectionBlueprint, {KustomizationScopeType} from '@src/navsections/KustomizationSectionBlueprint';
import {SectionRenderer, ResourceFilter} from '@components/molecules';
import AppContext from '@src/AppContext';
import {NAVIGATOR_HEIGHT_OFFSET} from '@constants/constants';
import {HelmValuesFile} from '@models/helm';
import {K8sResource} from '@models/k8sresource';
import {ClusterToLocalResourcesMatch} from '@models/appstate';
import ClusterDiffSectionBlueprint, {ClusterDiffScopeType} from '@src/navsections/ClusterDiffSectionBlueprint';
import styled from 'styled-components';
import {AppBorders} from '@styles/Borders';
import {Button, Popover} from 'antd';
import {FilterOutlined} from '@ant-design/icons';
import * as S from './ClusterDiff.styled';

const Container = styled.div<{height?: number}>`
  overflow-y: scroll;
  ::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
  ${props => props.height && `height: ${props.height};`}
`;

const TopContainer = styled(Container)`
  max-height: 200px;
  border-bottom: ${AppBorders.sectionDivider};
`;

function ClusterDiff() {
  const {windowSize} = useContext(AppContext);
  const windowHeight = windowSize.height;
  const navigatorHeight = windowHeight - NAVIGATOR_HEIGHT_OFFSET;

  return (
    <>
      <S.TitleBar>
        <MonoPaneTitle>Cluster Diff</MonoPaneTitle>
        <S.TitleBarRightButtons>
          <Popover content={<ResourceFilter />} trigger="click">
            <Button type="link" size="small" icon={<FilterOutlined />} />
          </Popover>
        </S.TitleBarRightButtons>
      </S.TitleBar>
      <S.List height={navigatorHeight}>
        <TopContainer>
          <SectionRenderer<HelmValuesFile, HelmChartScopeType>
            sectionBlueprint={HelmChartSectionBlueprint}
            level={0}
            isLastSection={false}
            itemRendererOptions={{
              disablePrefix: true,
              disableSuffix: true,
            }}
          />
          <SectionRenderer<K8sResource, KustomizationScopeType>
            sectionBlueprint={KustomizationSectionBlueprint}
            level={0}
            isLastSection={false}
            itemRendererOptions={{
              disablePrefix: true,
              disableSuffix: true,
            }}
          />
        </TopContainer>
        <Container height={navigatorHeight - 200}>
          <SectionRenderer<ClusterToLocalResourcesMatch, ClusterDiffScopeType>
            sectionBlueprint={ClusterDiffSectionBlueprint}
            level={0}
            isLastSection={false}
          />
        </Container>
      </S.List>
    </>
  );
}

export default ClusterDiff;
