import React, {useState} from 'react';
import {Col, Row, Select, Skeleton} from 'antd';
import styled from 'styled-components';
import micromatch from 'micromatch';
import {useSelector} from 'react-redux';

import {FontColors, BackgroundColors} from '@styles/Colors';
import {selectK8sResource, clearPreview} from '@redux/reducers/main';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {getNamespaces} from '@redux/utils/resource';
import {setFilterObjects} from '@redux/reducers/appConfig';
import {selectKustomizations, selectActiveResources, selectHelmCharts} from '@redux/selectors';
import {K8sResource} from '@models/k8sresource';
import {NavigatorSubSection} from '@models/navigator';
import {hasIncomingRefs, hasOutgoingRefs, hasUnsatisfiedRefs} from '@redux/utils/resourceRefs';
import {previewKustomization} from '@redux/reducers/thunks';
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

const NavigatorPane = () => {
  const dispatch = useAppDispatch();
  const [namespace, setNamespace] = useState<string>(ALL_NAMESPACES);

  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const previewResource = useAppSelector(state => state.main.previewResource);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const appConfig = useAppSelector(state => state.config);
  const kustomizations = useSelector(selectKustomizations);
  const resources = useSelector(selectActiveResources);
  const helmCharts = useSelector(selectHelmCharts);

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
      dispatch(previewKustomization(id));
    } else {
      dispatch(clearPreview());
    }
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
          defaultValue="ALL_NAMESPACES"
          onChange={handleNamespaceChange}
          size="small"
          style={{minWidth: '50%'}}
          bordered={false}
        >
          <Option value="ALL_NAMESPACES">all</Option>
          {getNamespaces(resourceMap).map(n => {
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
                            <SectionRow key={section.name}>
                              {section.subsections.map(subsection => {
                                const items = resources.filter(item => shouldBeVisible(item, subsection));
                                return (
                                  <SectionCol key={subsection.name}>
                                    <NavigatorContentSubTitle>
                                      {subsection.name} {items.length > 0 ? `(${items.length})` : ''}
                                    </NavigatorContentSubTitle>
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
                                );
                              })}
                            </SectionRow>
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
