import {Button, Divider} from 'antd';
import React, {useContext} from 'react';
import styled from 'styled-components';

import {useAppDispatch} from '@redux/hooks';
import {loadClusterDiff} from '@redux/thunks/loadClusterDiff';

// import {HelmValuesFile} from '@models/helm';
// import {K8sResource} from '@models/k8sresource';
import {ClusterToLocalResourcesMatch} from '@models/appstate';

// import {MonoPaneTitle} from '@components/atoms';
// import HelmChartSectionBlueprint, {HelmChartScopeType} from '@src/navsections/HelmChartSectionBlueprint';
// import KustomizationSectionBlueprint, {KustomizationScopeType} from '@src/navsections/KustomizationSectionBlueprint';
import {ResourceFilterIconWithPopover, SectionRenderer} from '@components/molecules';

import {ReloadOutlined} from '@ant-design/icons';

import {NAVIGATOR_HEIGHT_OFFSET} from '@constants/constants';

import AppContext from '@src/AppContext';
import ClusterDiffSectionBlueprint, {ClusterDiffScopeType} from '@src/navsections/ClusterDiffSectionBlueprint';

import * as S from './ClusterDiff.styled';
import ClusterDiffNamespaceFilter from './ClusterDiffNamespaceFilter';

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

const FilterContainer = styled.span`
  margin-left: 10px;
`;

const RefreshButton = styled(Button)`
  margin-top: 1px;
  margin-left: 8px;
`;

function ClusterDiff() {
  const dispatch = useAppDispatch();
  const {windowSize} = useContext(AppContext);
  const windowHeight = windowSize.height;
  const navigatorHeight = windowHeight - NAVIGATOR_HEIGHT_OFFSET;

  const onClickRefresh = () => {
    dispatch(loadClusterDiff());
  };

  return (
    <Container>
      <LeftPane>
        <S.TitleBar>
          <RefreshButton icon={<ReloadOutlined />} onClick={onClickRefresh} size="small" type="primary" ghost>
            Refresh
          </RefreshButton>
          <Divider type="vertical" style={{height: 40, marginLeft: 16}} />
          <S.TitleBarRightButtons>
            <ClusterDiffNamespaceFilter />
            <FilterContainer>
              <ResourceFilterIconWithPopover />
            </FilterContainer>
          </S.TitleBarRightButtons>
        </S.TitleBar>
        <S.List>
          <SectionRenderer<ClusterToLocalResourcesMatch, ClusterDiffScopeType>
            sectionBlueprint={ClusterDiffSectionBlueprint}
            level={0}
            isLastSection={false}
          />
        </S.List>
      </LeftPane>
      {/* <Divider type="vertical" style={{height: '100vh', margin: 0}} />
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
      </RightPane> */}
    </Container>
  );
}

export default ClusterDiff;
