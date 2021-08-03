import React, {useState} from 'react';
import {Col, Row, Skeleton} from 'antd';
import styled from 'styled-components';
import {useSelector} from 'react-redux';
import {inClusterMode, selectHelmCharts, selectKustomizations} from '@redux/selectors';

import Colors, {BackgroundColors} from '@styles/Colors';
import {useAppSelector} from '@redux/hooks';
import {MonoPaneTitle, MonoPaneTitleCol, PaneContainer, MonoSectionTitle} from '@atoms';
import {MinusSquareOutlined, PlusSquareOutlined} from '@ant-design/icons';

import HelmChartsSection from './components/HelmChartsSection';
import KustomizationsSection from './components/KustomizationsSection';
import ResourcesSection from './components/ResourcesSection';
import StyledCollapse from './components/StyledCollapse';
import StyledCollapsePanel from './components/StyledCollapsePanel';

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

const IconContainer = styled.span<{isSelected: boolean}>`
  font-size: 18px;
  font-weight: 400;
  cursor: pointer;
  float: right;
  margin-top: 3px;
  margin-right: 5px;
  ${props => {
    if (props.isSelected) {
      return `color: ${Colors.blackPure}`;
    }
    return `color: ${Colors.whitePure}`;
  }}
`;

const SectionHeader = (props: {title: string; isExpanded: boolean; onCollapse: () => void; onExpand: () => void}) => {
  const {title, isExpanded, onCollapse, onExpand} = props;

  const [isHovered, setIsHovered] = useState<Boolean>(false);
  const [isSelected, setIsSelected] = useState<boolean>(false);

  return (
    <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <MonoSectionTitle>
        {title}
        {isHovered && isExpanded && (
          <IconContainer isSelected={isSelected} onClick={onCollapse}>
            <MinusSquareOutlined />
          </IconContainer>
        )}
        {!isExpanded && (
          <IconContainer isSelected={isSelected} onClick={onExpand}>
            <PlusSquareOutlined />
          </IconContainer>
        )}
      </MonoSectionTitle>
    </div>
  );
};

const NavigatorPane = () => {
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const uiState = useAppSelector(state => state.ui);
  const helmCharts = useSelector(selectHelmCharts);
  const kustomizations = useSelector(selectKustomizations);
  const clusterMode = useSelector(inClusterMode);

  const [expandedSections, setExpandedSections] = useState<string[]>(['kustomizations', 'helmcharts']);

  const expandSection = (sectionName: string) => {
    if (!expandedSections.includes(sectionName)) {
      setExpandedSections([...expandedSections, sectionName]);
    }
  };

  const collapseSection = (sectionName: string) => {
    setExpandedSections(expandedSections.filter(s => s !== sectionName));
  };

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
          <StyledCollapse collapsible="disabled" ghost activeKey={expandedSections}>
            {!clusterMode && Object.values(helmCharts).length > 0 && (
              <StyledCollapsePanel
                key="helmcharts"
                showArrow={false}
                header={
                  <SectionHeader
                    title="Helm Charts"
                    isExpanded={expandedSections.indexOf('helmcharts') !== -1}
                    onExpand={() => expandSection('helmcharts')}
                    onCollapse={() => collapseSection('helmcharts')}
                  />
                }
              >
                <HelmChartsSection helmCharts={helmCharts} />
              </StyledCollapsePanel>
            )}
            {!clusterMode && kustomizations.length > 0 && (
              <StyledCollapsePanel
                key="kustomizations"
                showArrow={false}
                header={
                  <SectionHeader
                    title="Kustomizations"
                    isExpanded={expandedSections.indexOf('kustomizations') !== -1}
                    onExpand={() => expandSection('kustomizations')}
                    onCollapse={() => collapseSection('kustomizations')}
                  />
                }
              >
                <KustomizationsSection kustomizations={kustomizations} />
              </StyledCollapsePanel>
            )}
          </StyledCollapse>
        )}

        {uiState.isFolderLoading || previewLoader.isLoading ? <StyledSkeleton /> : <ResourcesSection />}
      </PaneContainer>
    </>
  );
};

export default NavigatorPane;
