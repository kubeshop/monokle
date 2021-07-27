import React from 'react';
import {Collapse} from 'antd';

import styled from 'styled-components';

import {K8sResource} from '@models/k8sresource';
import {NavigatorSubSection, NavigatorSection} from '@models/navigator';
import {hasIncomingRefs, hasOutgoingRefs, hasUnsatisfiedRefs} from '@redux/utils/resourceRefs';

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
    background: #111d2c;
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
                    key={item.id}
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

export default Section;
