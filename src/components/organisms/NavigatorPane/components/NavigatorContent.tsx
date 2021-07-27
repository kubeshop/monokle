import React, {useState} from 'react';
import {Select, Skeleton} from 'antd';
import styled from 'styled-components';
import micromatch from 'micromatch';
import {useSelector} from 'react-redux';

import {selectK8sResource} from '@redux/reducers/main';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectKustomizations, selectActiveResources, selectHelmCharts} from '@redux/selectors';
import {K8sResource} from '@models/k8sresource';
import {NavigatorSubSection} from '@models/navigator';
import {hasIncomingRefs, hasOutgoingRefs} from '@redux/utils/resourceRefs';
import {startPreview, stopPreview} from '@redux/utils/preview';
import {MonoSectionHeaderCol, MonoSectionTitle, PaneContainer} from '@atoms';
import NavigatorKustomizationRow from '@molecules/NavigatorKustomizationRow';
import NavigatorHelmRow from '@molecules/NavigatorHelmRow';
import {HelmChart} from '@models/helm';

import Section from './Section';
import SectionRow from './SectionRow';
import SectionCol from './SectionCol';
import NavigatorContentTitle from './NavigatorContentTitle';

import {ALL_NAMESPACES} from '../constants';

const {Option} = Select;

const StyledSkeleton = styled(Skeleton)`
  margin: 20px;
  width: 90%;
`;

const NavigatorContent = (props: {
  namespace: string;
  namespaces: string[];
  setNamespace: (namespace: string) => void;
}) => {
  const {namespace, namespaces, setNamespace} = props;
  const dispatch = useAppDispatch();

  const previewResource = useAppSelector(state => state.main.previewResource);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const kustomizations = useSelector(selectKustomizations);
  const resources = useSelector(selectActiveResources);
  const helmCharts = useSelector(selectHelmCharts);

  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const appConfig = useAppSelector(state => state.config);

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

  return (
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
              return <NavigatorHelmRow key={chart.id} rowKey={chart.id} helmChart={chart} />;
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
                    key={k.id}
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
                <div key={navigator.name}>
                  <SectionRow>
                    <MonoSectionHeaderCol>
                      <MonoSectionTitle>{navigator.name}</MonoSectionTitle>
                    </MonoSectionHeaderCol>
                  </SectionRow>
                  <SectionRow>
                    <SectionCol>
                      {navigator.sections.map(section => {
                        return (
                          <div key={section.name}>
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
                          </div>
                        );
                      })}
                    </SectionCol>
                  </SectionRow>
                </div>
              );
            })}
          </SectionCol>
        </SectionRow>
      )}
    </PaneContainer>
  );
};

export default NavigatorContent;
