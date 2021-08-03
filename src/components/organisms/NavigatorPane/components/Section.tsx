import React from 'react';
import {Collapse} from 'antd';

import styled from 'styled-components';

import {K8sResource} from '@models/k8sresource';
import {NavigatorSubSection, NavigatorSection} from '@models/navigator';
import {hasIncomingRefs, hasOutgoingRefs, hasUnsatisfiedRefs} from '@redux/utils/resourceRefs';

import Colors from '@styles/Colors';

import NavigatorResourceRow from '@molecules/NavigatorResourceRow';
import SubsectionHeader from './SubsectionHeader';

import SectionCol from './SectionCol';
import SectionRow from './SectionRow';

const StyledCollapse = styled(Collapse)`
  width: 100%;
  .ant-collapse-header {
    padding: 0 !important;
    cursor: default !important;
  }
  .ant-collapse-header:hover {
    background: ${Colors.blackPearl};
  }
`;

const StyledCollapsePanel = styled(Collapse.Panel)`
  width: 100%;
  .ant-collapse-content-box {
    padding: 0 !important;
  }
`;

const Section = (props: {
  expandedSubsections: string[];
  onSubsectionExpand: (sectionName: string, subsectionName: string) => void;
  onSubsectionCollapse: (sectionName: string, subsectionName: string) => void;
  section: NavigatorSection;
  resources: K8sResource[];
  shouldResourceBeVisible: (resource: K8sResource, subsection: NavigatorSubSection) => boolean;
  shouldSubsectionBeVisible: (subsection: NavigatorSubSection) => boolean;
  selectResource: (resourceId: string) => void;
}) => {
  const {
    expandedSubsections,
    onSubsectionExpand,
    onSubsectionCollapse,
    section,
    resources,
    shouldResourceBeVisible,
    shouldSubsectionBeVisible,
    selectResource,
  } = props;

  const isSubsectionExpanded = (subsectionName: string) => {
    return expandedSubsections.indexOf(subsectionName) !== -1;
  };

  return (
    <SectionRow key={section.name}>
      <StyledCollapse collapsible="disabled" ghost activeKey={expandedSubsections}>
        {section.subsections
          .filter(subsection => shouldSubsectionBeVisible(subsection))
          .map(subsection => {
            const visibleResources = resources.filter(item => shouldResourceBeVisible(item, subsection));
            return (
              <StyledCollapsePanel
                key={subsection.name}
                showArrow={false}
                header={
                  <SubsectionHeader
                    isExpanded={isSubsectionExpanded(subsection.name)}
                    isHighlighted={!isSubsectionExpanded(subsection.name) && visibleResources.some(r => r.highlight)}
                    isSelected={!isSubsectionExpanded(subsection.name) && visibleResources.some(r => r.selected)}
                    onExpand={() => onSubsectionExpand(section.name, subsection.name)}
                    onCollapse={() => onSubsectionCollapse(section.name, subsection.name)}
                    resourcesCount={visibleResources.length}
                    subsection={subsection}
                  />
                }
              >
                <SectionCol key={subsection.name}>
                  {visibleResources.map(resource => (
                    <NavigatorResourceRow
                      key={resource.id}
                      rowKey={resource.id}
                      label={resource.name}
                      isSelected={Boolean(resource.selected)}
                      highlighted={Boolean(resource.highlight)}
                      hasIncomingRefs={Boolean(hasIncomingRefs(resource))}
                      hasOutgoingRefs={Boolean(hasOutgoingRefs(resource))}
                      hasUnsatisfiedRefs={Boolean(hasUnsatisfiedRefs(resource))}
                      onClickResource={() => selectResource(resource.id)}
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

export default Section;
