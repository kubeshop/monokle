import React, {useState} from 'react';
import {MinusSquareOutlined, PlusSquareOutlined} from '@ant-design/icons';
import styled from 'styled-components';

import Colors, {FontColors} from '@styles/Colors';

import {NavigatorSubSection} from '@models/navigator';
import NavigatorContentSubTitle from './NavigatorContentSubTitle';

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

const SubsectionHeader = (props: {
  isExpanded: boolean;
  isHighlighted: boolean;
  isSelected: boolean;
  subsection: NavigatorSubSection;
  resourcesCount: number;
  onExpand: () => void;
  onCollapse: () => void;
}) => {
  const {subsection, resourcesCount, isExpanded, isHighlighted, isSelected, onExpand, onCollapse} = props;
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
          {resourcesCount > 0 ? `${resourcesCount}` : ''}
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

export default SubsectionHeader;
