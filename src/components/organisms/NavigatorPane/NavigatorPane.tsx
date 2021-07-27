import React from 'react';
import {Col, Row, Skeleton} from 'antd';
import styled from 'styled-components';
import {useSelector} from 'react-redux';
import {selectHelmCharts, selectKustomizations} from '@redux/selectors';

import {BackgroundColors} from '@styles/Colors';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setFilterObjects} from '@redux/reducers/appConfig';
import {MonoSwitch, MonoPaneTitle, MonoPaneTitleCol, PaneContainer} from '@atoms';

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
  const dispatch = useAppDispatch();

  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const helmCharts = useSelector(selectHelmCharts);
  const kustomizations = useSelector(selectKustomizations);

  const onFilterChange = (checked: boolean) => {
    dispatch(setFilterObjects(checked));
  };

  return (
    <>
      <TitleRow>
        <MonoPaneTitleCol span={24}>
          <Row>
            <Col span={12}>
              <MonoPaneTitle>Navigator</MonoPaneTitle>
            </Col>
            <Col span={12}>
              <MonoSwitch onClick={onFilterChange} label="RELATIONS" />
            </Col>
          </Row>
        </MonoPaneTitleCol>
      </TitleRow>
      <PaneContainer>
        {Object.values(helmCharts).length > 0 && <HelmChartsSection helmCharts={helmCharts} />}

        {kustomizations.length > 0 && <KustomizationsSection kustomizations={kustomizations} />}

        {previewLoader.isLoading ? <StyledSkeleton /> : <ResourcesSection />}
      </PaneContainer>
    </>
  );
};

export default NavigatorPane;
