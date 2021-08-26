import React, {useState, useContext, useEffect} from 'react';
import {Row, Skeleton} from 'antd';
import styled from 'styled-components';
import {useSelector} from 'react-redux';
import {
  isInClusterModeSelector,
  helmChartsSelector,
  helmValuesSelector,
  kustomizationsSelector,
} from '@redux/selectors';

import {HelmValuesFile} from '@models/helm';
import Colors, {BackgroundColors} from '@styles/Colors';
import {useAppSelector} from '@redux/hooks';
import {MonoPaneTitle, MonoPaneTitleCol, PaneContainer, MonoSectionTitle} from '@atoms';
import {MinusSquareOutlined, PlusSquareOutlined} from '@ant-design/icons';

import {NAVIGATOR_HEIGHT_OFFSET} from '@constants/constants';

import AppContext from '@src/AppContext';

import ValidationErrorsModal from '@components/molecules/ValidationErrorsModal';
import {ResourceValidationError} from '@models/k8sresource';

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
  height: 40px;
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

const SectionContainer = styled.span<{isSelected: boolean; isHighlighted: boolean}>`
  width: 100%;
  display: block;
  ${props => {
    if (!props.isSelected && props.isHighlighted) {
      return `background: ${Colors.highlightGradient};`;
    }
    if (props.isSelected) {
      return `
        background: ${Colors.selectionGradient};
      `;
    }
  }}
`;

const SectionTitleSpan = styled.span<{isSelected: boolean}>`
  ${props => {
    if (props.isSelected) {
      return `
      color: ${Colors.blackPure} !important;
    `;
    }
  }}
`;

const TitleBarContainer = styled.div`
  display: flex;
  height: 24px;
  justify-content: space-between;
`;

const NavigatorPaneContainer = styled(PaneContainer)`
  white-space: nowrap;
`;

const SectionHeader = (props: {
  title: string;
  isExpanded: boolean;
  onCollapse: () => void;
  onExpand: () => void;
  isHighlighted?: boolean;
  isSelected?: boolean;
}) => {
  const {title, isExpanded, onCollapse, onExpand, isHighlighted, isSelected} = props;

  const [isHovered, setIsHovered] = useState<Boolean>(false);

  return (
    <SectionContainer
      isSelected={Boolean(isSelected)}
      isHighlighted={Boolean(isHighlighted)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <MonoSectionTitle>
        <SectionTitleSpan isSelected={Boolean(isSelected)}>{title}</SectionTitleSpan>
        {isHovered && isExpanded && (
          <IconContainer isSelected={Boolean(isSelected)} onClick={onCollapse}>
            <MinusSquareOutlined />
          </IconContainer>
        )}
        {!isExpanded && (
          <IconContainer isSelected={Boolean(isSelected)} onClick={onExpand}>
            <PlusSquareOutlined />
          </IconContainer>
        )}
      </MonoSectionTitle>
    </SectionContainer>
  );
};

const NavigatorPane = () => {
  const {windowSize} = useContext(AppContext);
  const windowHeight = windowSize.height;
  const navigatorHeight = windowHeight - NAVIGATOR_HEIGHT_OFFSET;
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const uiState = useAppSelector(state => state.ui);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const helmCharts = useSelector(helmChartsSelector);
  const helmValues = useSelector(helmValuesSelector);
  const kustomizations = useSelector(kustomizationsSelector);
  const isInClusterMode = useSelector(isInClusterModeSelector);

  const [isValidationsErrorsModalVisible, setValidationsErrorsVisible] = useState<boolean>(false);
  const [currentValidationErrors, setCurrentValidationErrors] = useState<ResourceValidationError[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>(['kustomizations', 'helmcharts']);

  const expandSection = (sectionName: string) => {
    if (!expandedSections.includes(sectionName)) {
      setExpandedSections([...expandedSections, sectionName]);
    }
  };

  const collapseSection = (sectionName: string) => {
    setExpandedSections(expandedSections.filter(s => s !== sectionName));
  };

  const isSectionExpanded = (sectionName: string) => {
    return expandedSections.indexOf(sectionName) !== -1;
  };

  useEffect(() => {
    if (kustomizations.some(kustomization => kustomization.id === selectedResourceId)) {
      expandSection('kustomizations');
    }
  }, [selectedResourceId]);

  const showValidationsErrorsModal = (errors: ResourceValidationError[]) => {
    setValidationsErrorsVisible(true);
    setCurrentValidationErrors(errors);
  };

  const hideValidationsErrorsModal = () => {
    setValidationsErrorsVisible(false);
    setCurrentValidationErrors([]);
  };

  return (
    <>
      <ValidationErrorsModal
        errors={currentValidationErrors}
        isVisible={isValidationsErrorsModalVisible}
        onClose={hideValidationsErrorsModal}
      />
      <TitleRow>
        <MonoPaneTitleCol span={24}>
          <MonoPaneTitle>
            <TitleBarContainer>
              <span>Navigator</span>
            </TitleBarContainer>
          </MonoPaneTitle>
        </MonoPaneTitleCol>
      </TitleRow>
      <NavigatorPaneContainer
        style={{
          height: windowHeight && windowHeight > NAVIGATOR_HEIGHT_OFFSET ? navigatorHeight : '100%',
        }}
      >
        {uiState.isFolderLoading ? (
          <StyledSkeleton active />
        ) : (
          <StyledCollapse collapsible="disabled" ghost activeKey={expandedSections}>
            {!isInClusterMode && !previewLoader.isLoading && Object.values(helmCharts).length > 0 && (
              <StyledCollapsePanel
                key="helmcharts"
                showArrow={false}
                header={
                  <SectionHeader
                    title="Helm Charts"
                    isExpanded={expandedSections.indexOf('helmcharts') !== -1}
                    onExpand={() => expandSection('helmcharts')}
                    onCollapse={() => collapseSection('helmcharts')}
                    isSelected={
                      !isSectionExpanded('helmcharts') &&
                      Object.values(helmCharts).some(h =>
                        h.valueFileIds
                          .map(v => helmValues[v])
                          .some((valuesFile: HelmValuesFile) => valuesFile.isSelected)
                      )
                    }
                  />
                }
              >
                <HelmChartsSection helmCharts={helmCharts} />
              </StyledCollapsePanel>
            )}
            {!isInClusterMode && !previewLoader.isLoading && kustomizations.length > 0 && (
              <StyledCollapsePanel
                key="kustomizations"
                showArrow={false}
                header={
                  <SectionHeader
                    title="Kustomizations"
                    isExpanded={expandedSections.indexOf('kustomizations') !== -1}
                    onExpand={() => expandSection('kustomizations')}
                    onCollapse={() => collapseSection('kustomizations')}
                    isSelected={!isSectionExpanded('kustomizations') && kustomizations.some(k => k.isSelected)}
                    isHighlighted={!isSectionExpanded('kustomizations') && kustomizations.some(k => k.isHighlighted)}
                  />
                }
              >
                <KustomizationsSection kustomizations={kustomizations} />
              </StyledCollapsePanel>
            )}
          </StyledCollapse>
        )}

        {uiState.isFolderLoading || previewLoader.isLoading ? (
          <StyledSkeleton />
        ) : (
          <ResourcesSection showErrorsModal={showValidationsErrorsModal} />
        )}
      </NavigatorPaneContainer>
    </>
  );
};

export default NavigatorPane;
