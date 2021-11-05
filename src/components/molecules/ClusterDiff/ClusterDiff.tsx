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
import {Button, Popover} from 'antd';
import {FilterOutlined} from '@ant-design/icons';
import ResourceNamespaceFilter from '../ResourceNamespaceFilter';
import * as S from './ClusterDiff.styled';

const Container = styled.div<{height?: number}>`
  display: flex;
  ${props => props.height && `height: ${props.height};`}
`;

const RightPane = styled.div`
  width: 300px;
`;

const LeftPane = styled.div`
  flex-grow: 1;
`;

const NamespaceFilterContainer = styled.div`
  display: flex;
  align-items: center;
  width: 300px;
`;

const NamespaceFilterLabel = styled.span`
  margin-right: 10px;
`;

function ClusterDiff() {
  const {windowSize} = useContext(AppContext);
  const windowHeight = windowSize.height;
  const navigatorHeight = windowHeight - NAVIGATOR_HEIGHT_OFFSET;

  return (
    <Container>
      <LeftPane>
        <S.TitleBar>
          <MonoPaneTitle>Cluster Diff</MonoPaneTitle>
          <S.TitleBarRightButtons>
            <Popover content={<ResourceFilter />} trigger="click">
              <Button type="link" size="small" icon={<FilterOutlined />} />
            </Popover>
            <NamespaceFilterContainer>
              <NamespaceFilterLabel>Namespace:</NamespaceFilterLabel> <ResourceNamespaceFilter />
            </NamespaceFilterContainer>
          </S.TitleBarRightButtons>
        </S.TitleBar>
        <S.List height={navigatorHeight}>
          <SectionRenderer<ClusterToLocalResourcesMatch, ClusterDiffScopeType>
            sectionBlueprint={ClusterDiffSectionBlueprint}
            level={0}
            isLastSection={false}
          />
        </S.List>
      </LeftPane>
      <RightPane>
        <S.TitleBar>
          <MonoPaneTitle>Navigator</MonoPaneTitle>
        </S.TitleBar>
        <S.List height={navigatorHeight}>
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
        </S.List>
      </RightPane>
    </Container>
  );
}

export default ClusterDiff;
