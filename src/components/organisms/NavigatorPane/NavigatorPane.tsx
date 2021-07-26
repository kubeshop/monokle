import React, {useEffect, useState} from 'react';
import {Col, Row, Select, Skeleton, Collapse} from 'antd';
import {MinusSquareOutlined, PlusSquareOutlined} from '@ant-design/icons';
import styled from 'styled-components';
import micromatch from 'micromatch';
import {useSelector} from 'react-redux';

import Colors, {FontColors, BackgroundColors} from '@styles/Colors';
import {selectK8sResource} from '@redux/reducers/main';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {getNamespaces} from '@redux/utils/resource';
import {setFilterObjects} from '@redux/reducers/appConfig';
import {selectKustomizations, selectActiveResources, selectHelmCharts} from '@redux/selectors';
import {K8sResource} from '@models/k8sresource';
import {NavigatorSubSection, NavigatorSection} from '@models/navigator';
import {hasIncomingRefs, hasOutgoingRefs, hasUnsatisfiedRefs} from '@redux/utils/resourceRefs';
import {startPreview, stopPreview} from '@redux/utils/preview';
import {
  MonoSwitch,
  MonoSectionHeaderCol,
  MonoSectionTitle,
  PaneContainer,
  MonoPaneTitle,
  MonoPaneTitleCol,
  NavigatorContentTitle,
  NavigatorContentSubTitle,
} from '@atoms';
import NavigatorKustomizationRow from '@molecules/NavigatorKustomizationRow';
import NavigatorResourceRow from '@molecules/NavigatorResourceRow';
import NavigatorHelmRow from '@molecules/NavigatorHelmRow';
import {HelmChart} from '@models/helm';

const {Option} = Select;
const ALL_NAMESPACES = '- all -';

const TitleRow = styled(Row)`
  width: 100%;
  margin: 0;
  padding: 0;
  background: ${BackgroundColors.darkThemeBackground};
`;

const SectionRow = styled(Row)`
  width: 100%;
  margin: 0;
  padding: 0;
  & .ant-select-selection-item {
    color: ${FontColors.elementSelectTitle};
  }
`;

const SectionCol = styled(Col)`
  width: 100%;
  margin: 0;
  padding: 0;
`;

const StyledSkeleton = styled(Skeleton)`
  margin: 20px;
  width: 90%;
`;

const StyledCollapse = styled(Collapse)`
  width: 100%;
  .ant-collapse-header {
    padding: 0 !important;
    cursor: default !important;
  }
  .ant-collapse-header:hover {
    background: #111d2c;
  }
`;

const StyledCollapsePanel = styled(Collapse.Panel)`
  width: 100%;
  .ant-collapse-content-box {
    padding: 0 !important;
  }
`;

const SubsectionName = styled.span<{isSelected: boolean}>`
  ${props => {
    if (props.isSelected) {
      return `color: ${Colors.blackPure} !important`;
    }
  }}
`;

const StyledResourcesLength = styled.span<{isSelected: boolean}>`
  margin-left: 10px;
  ${props => {
    if (props.isSelected) {
      return `color: ${Colors.blackPure} !important`;
    }
    return `color: ${FontColors.grey} !important;`;
  }}
`;

const IconContainer = styled.span<{isSelected: boolean}>`
  cursor: pointer;
  float: right;
  margin-right: 5px;
  ${props => {
    if (props.isSelected) {
      return `color: ${Colors.blackPure}`;
    }
    return `color: ${Colors.whitePure}`;
  }}
`;

const SubsectionContainer = styled.span<{isHighlighted: boolean; isSelected: boolean}>`
  width: 100%;
  display: block;
  ${props => {
    if (props.isHighlighted) {
      return `background: ${Colors.highlightGradient};`;
    }
    if (props.isSelected) {
      return `
        background: ${Colors.selectionGradient};
      `;
    }
  }}
`;

const SubsectionHeader = (props: {
  isExpanded: boolean;
  isHighlighted: boolean;
  isSelected: boolean;
  subsection: NavigatorSubSection;
  items: K8sResource[];
  onExpand: () => void;
  onCollapse: () => void;
}) => {
  const {subsection, items, isExpanded, isHighlighted, isSelected, onExpand, onCollapse} = props;
  const [isHovered, setIsHovered] = useState<Boolean>(false);

  return (
    <SubsectionContainer
      isHighlighted={isHighlighted}
      isSelected={isSelected}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <NavigatorContentSubTitle>
        <SubsectionName isSelected={isSelected}>{subsection.name}</SubsectionName>
        <StyledResourcesLength isSelected={isSelected}>
          {items.length > 0 ? `${items.length}` : ''}
        </StyledResourcesLength>
      </NavigatorContentSubTitle>
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
    </SubsectionContainer>
  );
};

const Section = (props: {
  expandedSubsections: string[];
  onSubsectionExpand: (sectionName: string, subsectionName: string) => void;
  onSubsectionCollapse: (sectionName: string, subsectionName: string) => void;
  section: NavigatorSection;
  resources: K8sResource[];
  shouldBeVisible: (item: K8sResource, subsection: NavigatorSubSection) => boolean;
  selectResource: (resourceId: string) => void;
}) => {
  const {
    expandedSubsections,
    onSubsectionExpand,
    onSubsectionCollapse,
    section,
    resources,
    shouldBeVisible,
    selectResource,
  } = props;

  const isSubsectionExpanded = (subsectionName: string) => {
    return expandedSubsections.indexOf(subsectionName) !== -1;
  };

  return (
    <SectionRow key={section.name}>
      <StyledCollapse collapsible="disabled" ghost activeKey={expandedSubsections}>
        {section.subsections.map(subsection => {
          const items = resources.filter(item => shouldBeVisible(item, subsection));
          return (
            <StyledCollapsePanel
              key={subsection.name}
              showArrow={false}
              header={
                <SubsectionHeader
                  isExpanded={isSubsectionExpanded(subsection.name)}
                  isHighlighted={!isSubsectionExpanded(subsection.name) && items.some(i => i.highlight)}
                  isSelected={!isSubsectionExpanded(subsection.name) && items.some(i => i.selected)}
                  onExpand={() => onSubsectionExpand(section.name, subsection.name)}
                  onCollapse={() => onSubsectionCollapse(section.name, subsection.name)}
                  items={items}
                  subsection={subsection}
                />
              }
            >
              <SectionCol key={subsection.name}>
                {items.map(item => (
                  <NavigatorResourceRow
                    rowKey={item.id}
                    label={item.name}
                    isSelected={Boolean(item.selected)}
                    highlighted={Boolean(item.highlight)}
                    hasIncomingRefs={Boolean(hasIncomingRefs(item))}
                    hasOutgoingRefs={Boolean(hasOutgoingRefs(item))}
                    hasUnsatisfiedRefs={Boolean(hasUnsatisfiedRefs(item))}
                    onClickResource={() => selectResource(item.id)}
                  />
                ))}
              </SectionCol>
            </StyledCollapsePanel>
          );
        })}
      </StyledCollapse>
    </SectionRow>
  );
};

const NavigatorPane = () => {
  const dispatch = useAppDispatch();
  const [namespace, setNamespace] = useState<string>(ALL_NAMESPACES);
  const [namespaces, setNamespaces] = useState<string[]>([ALL_NAMESPACES]);

  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const previewResource = useAppSelector(state => state.main.previewResource);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const appConfig = useAppSelector(state => state.config);
  const kustomizations = useSelector(selectKustomizations);
  const resources = useSelector(selectActiveResources);
  const helmCharts = useSelector(selectHelmCharts);

  const [expandedSubsectionsBySection, setExpandedSubsectionsBySection] = useState<Record<string, string[]>>(
    // set all subsections of each section as expanded by default
    Object.fromEntries(
      appConfig.navigators
        .map(navigator => navigator.sections)
        .flat()
        .map(section => [section.name, section.subsections.map(subsection => subsection.name)])
    )
  );

  const selectResource = (resourceId: string) => {
    dispatch(selectK8sResource(resourceId));
  };

  const onFilterChange = (checked: boolean) => {
    dispatch(setFilterObjects(checked));
  };

  const handleNamespaceChange = (value: any) => {
    setNamespace(value);
  };

  const selectPreview = (id: string) => {
    if (id !== selectedResource) {
      dispatch(selectK8sResource(id));
    }
    if (id !== previewResource) {
      startPreview(id, 'kustomization', dispatch);
    } else {
      stopPreview(dispatch);
    }
  };

  useEffect(() => {
    let ns = getNamespaces(resourceMap);
    setNamespaces(ns.concat([ALL_NAMESPACES]));
    if (namespace && ns.indexOf(namespace) === -1) {
      setNamespace(ALL_NAMESPACES);
    }
  }, [resourceMap, previewResource]);

  const handleSubsectionExpand = (sectionName: string, subsectionName: string) => {
    setExpandedSubsectionsBySection({
      ...expandedSubsectionsBySection,
      [sectionName]: [...(expandedSubsectionsBySection[sectionName] || []), subsectionName],
    });
  };

  const handleSubsectionCollapse = (sectionName: string, subsectionName: string) => {
    setExpandedSubsectionsBySection({
      ...expandedSubsectionsBySection,
      [sectionName]: expandedSubsectionsBySection[sectionName].filter(s => s !== subsectionName),
    });
  };

  function shouldBeVisible(item: K8sResource, subsection: NavigatorSubSection) {
    return (
      (!appConfig.settings.filterObjectsOnSelection || item.highlight || item.selected || !selectedResource) &&
      item.kind === subsection.kindSelector &&
      micromatch.isMatch(item.version, subsection.apiVersionSelector) &&
      (namespace === ALL_NAMESPACES || item.namespace === namespace || (namespace === 'default' && !item.namespace))
    );
  }

  const NavigatorsContent = () => (
    <PaneContainer>
      {Object.values(helmCharts).length > 0 && (
        <SectionRow>
          <SectionCol>
            <SectionRow>
              <MonoSectionHeaderCol>
                <MonoSectionTitle>Helm Charts</MonoSectionTitle>
              </MonoSectionHeaderCol>
            </SectionRow>
            {Object.values(helmCharts).map((chart: HelmChart) => {
              return <NavigatorHelmRow rowKey={chart.id} helmChart={chart} />;
            })}
          </SectionCol>
        </SectionRow>
      )}

      {kustomizations.length > 0 && (
        <SectionRow>
          <SectionCol>
            <SectionRow>
              <MonoSectionHeaderCol>
                <MonoSectionTitle>Kustomizations</MonoSectionTitle>
              </MonoSectionHeaderCol>
            </SectionRow>
            {kustomizations
              .filter(
                k =>
                  !appConfig.settings.filterObjectsOnSelection ||
                  k.highlight ||
                  k.selected ||
                  !selectedResource ||
                  previewResource === k.id
              )
              .map((k: K8sResource) => {
                const isSelected = k.selected || previewResource === k.id;
                const isDisabled = Boolean(previewResource && previewResource !== k.id);
                const isHighlighted = k.highlight;
                const buttonActive = previewResource !== undefined && previewResource === k.id;

                return (
                  <NavigatorKustomizationRow
                    rowKey={k.id}
                    resource={k}
                    isSelected={isSelected}
                    isDisabled={isDisabled}
                    highlighted={isHighlighted}
                    previewButtonActive={buttonActive}
                    hasIncomingRefs={Boolean(hasIncomingRefs(k))}
                    hasOutgoingRefs={Boolean(hasOutgoingRefs(k))}
                    onClickResource={!previewResource ? () => selectResource(k.id) : undefined}
                    onClickPreview={() => selectPreview(k.id)}
                    isPreviewLoading={previewLoader.isLoading && k.id === previewLoader.targetResourceId}
                  />
                );
              })}
          </SectionCol>
        </SectionRow>
      )}
      <SectionRow style={{paddingLeft: 16}}>
        Namespace:
        <Select
          showSearch
          placeholder="Namespace"
          onChange={handleNamespaceChange}
          size="small"
          style={{minWidth: '50%'}}
          bordered={false}
          value={namespace}
        >
          {namespaces.map(n => {
            return (
              <Option key={n} value={n}>
                {n}
              </Option>
            );
          })}
        </Select>
      </SectionRow>

      {previewLoader.isLoading ? (
        <StyledSkeleton />
      ) : (
        <SectionRow>
          <SectionCol>
            {appConfig.navigators.map(navigator => {
              return (
                <>
                  <SectionRow>
                    <MonoSectionHeaderCol>
                      <MonoSectionTitle>{navigator.name}</MonoSectionTitle>
                    </MonoSectionHeaderCol>
                  </SectionRow>
                  <SectionRow>
                    <SectionCol>
                      {navigator.sections.map(section => {
                        return (
                          <>
                            {section.name.length > 0 && (
                              <SectionRow>
                                <NavigatorContentTitle>{section.name}</NavigatorContentTitle>
                              </SectionRow>
                            )}
                            <Section
                              expandedSubsections={expandedSubsectionsBySection[section.name]}
                              onSubsectionExpand={handleSubsectionExpand}
                              onSubsectionCollapse={handleSubsectionCollapse}
                              section={section}
                              shouldBeVisible={shouldBeVisible}
                              resources={resources}
                              selectResource={selectResource}
                            />
                          </>
                        );
                      })}
                    </SectionCol>
                  </SectionRow>
                </>
              );
            })}
          </SectionCol>
        </SectionRow>
      )}
    </PaneContainer>
  );
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
      <NavigatorsContent />
    </>
  );
};

export default NavigatorPane;
