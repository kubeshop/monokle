import {Skeleton as RawSkeleton} from 'antd';

import styled from 'styled-components';

import Colors, {FontColors} from '@styles/Colors';

type NameContainerProps = {
  isSelected?: boolean;
  isHighlighted?: boolean;
  isHovered?: boolean;
  isLastSection?: boolean;
  isCollapsed?: boolean;
  hasChildSections?: boolean;
  isVisible?: boolean;
  isInitialized?: boolean;
  disableHoverStyle?: boolean;
};

export const NameContainer = styled.li<NameContainerProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  user-select: none;
  ${props => {
    if (props.isVisible === false) {
      return 'visibility: hidden; height: 0;';
    }
    return 'visibility: visible;';
  }}
  ${props => {
    if (props.isLastSection && (props.isCollapsed || !props.isInitialized) && !props.hasChildSections) {
      return `margin-bottom: 12px;`;
    }
  }}
    ${props => {
    if (props.disableHoverStyle) {
      return;
    }
    if (!props.isSelected && props.isHighlighted) {
      if (props.isHovered) {
        return `background: ${Colors.highlightGradientHover};`;
      }
      return `background: ${Colors.highlightGradient};`;
    }
    if (props.isSelected) {
      if (props.isHovered) {
        return `background: ${Colors.selectionGradientHover};`;
      }
      return `background: ${Colors.selectionGradient};`;
    }
    if (props.isHovered) {
      return `background: ${Colors.blackPearl};`;
    }
  }};
`;

export const Name = styled.span<{isSelected?: boolean; isHighlighted?: boolean; level: number}>`
  padding: 2px 16px;
  font-size: ${props => {
    return `${24 - 4 * props.level}px;`;
  }};
  margin-left: ${props => {
    return `${8 * props.level}px`;
  }};
  cursor: pointer;
  ${props => {
    if (props.isSelected) {
      return `font-weight: 700;`;
    }
    if (props.isHighlighted) {
      return `font-weight: 500;`;
    }
  }};
  ${props => {
    if (props.isSelected) {
      return `color: ${Colors.blackPure};`;
    }
    return `color: ${Colors.whitePure};`;
  }};
`;

export const Collapsible = styled.span`
  margin-left: auto;
  margin-right: 15px;
`;

export const Skeleton = styled(RawSkeleton)`
  margin: 20px;
  width: 90%;
`;

export const ItemsLength = styled.span<{selected: boolean}>`
  margin-left: 8px;
  font-size: 14px;
  ${props => (props.selected ? `color: ${Colors.blackPure};` : `color: ${FontColors.grey};`)}
`;

export const EmptyDisplayContainer = styled.div<{level: number}>`
  margin-left: ${props => {
    return `${16 + 8 * props.level}px`;
  }};
`;

export const BlankSpace = styled.span<{level?: number}>`
  flex-grow: 1;
  height: 32px;
  cursor: pointer;
  ${props => props.level && `height: ${32 - props.level * 8}px;`}
`;
