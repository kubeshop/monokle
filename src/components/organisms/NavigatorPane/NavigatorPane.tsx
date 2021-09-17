import React, {useState, useContext, useEffect, useCallback} from 'react';
import {Row, Skeleton, Button, Popover} from 'antd';
import styled from 'styled-components';
import {useSelector} from 'react-redux';
import {
  isInClusterModeSelector,
  helmChartsSelector,
  helmValuesSelector,
  kustomizationsSelector,
  isInPreviewModeSelector,
} from '@redux/selectors';

import {HelmValuesFile} from '@models/helm';
import Colors, {BackgroundColors} from '@styles/Colors';
import {useAppSelector, useAppDispatch} from '@redux/hooks';
import {MonoPaneTitle, MonoPaneTitleCol, PaneContainer, MonoSectionTitle} from '@atoms';
import {MinusSquareOutlined, PlusSquareOutlined, PlusOutlined, FilterOutlined} from '@ant-design/icons';
import {openNewResourceWizard} from '@redux/reducers/ui';

import {NAVIGATOR_HEIGHT_OFFSET, ROOT_FILE_ENTRY} from '@constants/constants';

import AppContext from '@src/AppContext';

import ValidationErrorsModal from '@components/molecules/ValidationErrorsModal';
import ResourceFilter from '@components/molecules/ResourceFilter';
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

const RightButtons = styled.div`
  float: right;
  display: flex;
`;

const NavigatorPaneContainer = styled(PaneContainer)`
  white-space: nowrap;
`;

const StyledPlusButton = styled(Button)``;

const StyledFilterButton = styled(Button)``;

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
  const dispatch = useAppDispatch();
  const {windowSize} = useContext(AppContext);
  const windowHeight = windowSize.height;
  const navigatorHeight = windowHeight - NAVIGATOR_HEIGHT_OFFSET;
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const uiState = useAppSelector(state => state.ui);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const helmCharts = useSelector(helmChartsSelector);
  const helmValues = useSelector(helmValuesSelector);
  const kustomizations = useSelector(kustomizationsSelector);
  const isInClusterMode = useSelector(isInClusterModeSelector);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const resourceFilter = useAppSelector(state => state.main.resourceFilter);

  const [isValidationsErrorsModalVisible, setValidationsErrorsVisible] = useState<boolean>(false);
  const [currentValidationErrors, setCurrentValidationErrors] = useState<ResourceValidationError[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>(['kustomizations', 'helmcharts']);

  const doesRootFileEntryExist = useCallback(() => {
    return Boolean(fileMap[ROOT_FILE_ENTRY]);
  }, [fileMap]);

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

  const onClickNewResource = () => {
    dispatch(openNewResourceWizard());
  };

  useEffect(() => {
    if (kustomizations.some(kustomization => kustomization.id === selectedResourceId)) {
      expandSection('kustomizations');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResourceId, kustomizations]);

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
      <ValidationErrorsModal />
      <TitleRow>
        <MonoPaneTitleCol span={24}>
          <MonoPaneTitle>
            <TitleBarContainer>
              <span>Navigator</span>
              <RightButtons>
                <StyledPlusButton
                  disabled={!doesRootFileEntryExist() || isInClusterMode || isInPreviewMode}
                  onClick={onClickNewResource}
                  type="link"
                  size="small"
                  icon={<PlusOutlined />}
                />
                <Popover content={<ResourceFilter />} trigger="click">
                  <StyledFilterButton
                    disabled={!doesRootFileEntryExist() && !isInClusterMode && !isInPreviewMode}
                    type="link"
                    size="small"
                    icon={<FilterOutlined />}
                  />
                </Popover>
              </RightButtons>
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
          <ResourcesSection filters={resourceFilter} showErrorsModal={showValidationsErrorsModal} />
        )}
      </NavigatorPaneContainer>
    </>
  );
};

export default NavigatorPane;
