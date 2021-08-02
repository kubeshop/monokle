import React from 'react';
import {Col, Row, Skeleton} from 'antd';
import styled from 'styled-components';
import {useSelector} from 'react-redux';
import {inClusterMode, selectHelmCharts, selectKustomizations} from '@redux/selectors';

import {BackgroundColors} from '@styles/Colors';
import {useAppSelector} from '@redux/hooks';
import {MonoPaneTitle, MonoPaneTitleCol, PaneContainer} from '@atoms';

import HelmChartsSection from './components/HelmChartsSection';
import KustomizationsSection from './components/KustomizationsSection';
import ResourcesSection from './components/ResourcesSection';

const StyledSkeleton = styled(Skeleton)`
  margin: 20px;
  width: 90%;
`;

const TitleRow = styled(Row)`
  width: 100%;
  margin: 0;
  padding: 0;
  background: ${BackgroundColors.darkThemeBackground};
`;

const NavigatorPane = () => {
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const uiState = useAppSelector(state => state.ui);
  const helmCharts = useSelector(selectHelmCharts);
  const kustomizations = useSelector(selectKustomizations);
  const clusterMode = useSelector(inClusterMode);

  return (
    <>
      <TitleRow>
        <MonoPaneTitleCol span={24}>
          <Row>
            <Col span={12}>
              <MonoPaneTitle>Navigator</MonoPaneTitle>
            </Col>
          </Row>
        </MonoPaneTitleCol>
      </TitleRow>
      <PaneContainer>
        {uiState.isFolderLoading ? (
          <StyledSkeleton />
        ) : (
          !clusterMode && Object.values(helmCharts).length > 0 && <HelmChartsSection helmCharts={helmCharts} />
        )}

        {uiState.isFolderLoading ? (
          <StyledSkeleton />
        ) : (
          !clusterMode && kustomizations.length > 0 && <KustomizationsSection kustomizations={kustomizations} />
        )}

        {uiState.isFolderLoading || previewLoader.isLoading ? <StyledSkeleton /> : <ResourcesSection />}
      </PaneContainer>
    </>
  );
};

export default NavigatorPane;
