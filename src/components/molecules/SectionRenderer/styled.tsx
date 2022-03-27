import {Checkbox as RawCheckbox, Skeleton as RawSkeleton} from 'antd';

import styled from 'styled-components';

import Colors, {FontColors} from '@styles/Colors';

type NameContainerProps = {
  $hasCustomNameDisplay: boolean;
  $indentation: number;
  isHovered?: boolean;
  isCheckable?: boolean;
};

export const NameContainer = styled.span<NameContainerProps>`
  display: flex;
  align-items: center;
  width: 100%;
  ${props => {
    const defaultIndentation = props.isCheckable ? 24 : 0;
    return `padding-left: ${defaultIndentation + props.$indentation}px;`;
  }}
  ${props => !props.isHovered && 'padding-right: 30px;'}
  ${props => props.$hasCustomNameDisplay && 'padding: 0;'}
`;

type SectionContainerProps = {
  isSelected?: boolean;
  isHighlighted?: boolean;
  isHovered?: boolean;
  isLastSection?: boolean;
  isCollapsed?: boolean;
  hasChildSections?: boolean;
  isVisible?: boolean;
  isInitialized?: boolean;
  disableHoverStyle?: boolean;
  isSectionCheckable?: boolean;
  hasCustomNameDisplay?: boolean;
};

export const SectionContainer = styled.li<SectionContainerProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  user-select: none;
  ${props =>
    (!props.isSectionCheckable && !props.hasCustomNameDisplay) || !props.isInitialized ? 'padding-left: 16px;' : ''}
  ${props => {
    if (props.isVisible === false) {
      return 'visibility: hidden; height: 0;';
    }
    return 'visibility: visible;';
  }}
  ${props => {
    if (props.isLastSection && (props.isCollapsed || !props.isInitialized) && !props.hasChildSections) {
      return `margin-bottom: 16px;`;
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

type NameProps = {
  $isSelected?: boolean;
  $isHighlighted?: boolean;
  $isCheckable?: boolean;
  $level: number;
  $nameColor?: string;
  $nameSize?: number;
  $nameWeight?: number;
  $nameVerticalPadding?: number;
  $nameHorizontalPadding?: number;
};

export const Name = styled.span<NameProps>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  ${props =>
    `padding: ${props.$nameVerticalPadding !== undefined ? props.$nameVerticalPadding : 0}px ${
      props.$nameHorizontalPadding !== undefined ? props.$nameHorizontalPadding : 5
    }px;`}
  cursor: pointer;
  ${props => {
    if (props.$nameSize) {
      return `font-size: ${props.$nameSize}px;`;
    }
    return `font-size: ${24 - 4 * props.$level}px;`;
  }}
  ${props => {
    if (props.$isSelected) {
      return `font-weight: 700;`;
    }
    if (props.$isHighlighted) {
      return `font-weight: 500;`;
    }
  }}
  ${props => {
    if (props.$isSelected) {
      return `color: ${Colors.blackPure};`;
    }
    return props.$nameColor ? `color: ${props.$nameColor};` : `color: ${Colors.whitePure};`;
  }}
  ${props => props.$nameWeight && `font-weight: ${props.$nameWeight};`}
`;

export const EmptyGroupText = styled.p`
  margin-left: 26px;
  margin-bottom: 12px;
  font-size: 12px;
`;

export const Collapsible = styled.span`
  margin-left: auto;
  margin-right: 15px;
`;

export const Skeleton = styled(RawSkeleton)`
  margin: 20px;
  width: 90%;
`;

export const Counter = styled.span<{selected: boolean}>`
  margin-left: 8px;
  font-size: 14px;
  ${props => (props.selected ? `color: ${Colors.blackPure};` : `color: ${FontColors.grey};`)}
`;

export const EmptyDisplayContainer = styled.div<{level: number}>`
  margin-left: 16px;
`;

export const BeforeInitializationContainer = styled.div<{level: number}>`
  padding-top: 16px;
  margin-left: 16px;
`;

export const BlankSpace = styled.span<{level?: number}>`
  flex-grow: 1;
  height: 32px;
  cursor: pointer;
  ${props => props.level && `height: ${32 - props.level * 8}px;`}
`;

export const Checkbox = styled(RawCheckbox)<{$level: number}>`
  margin-left: -16px;
`;

export const CheckboxPlaceholder = styled.span<{$level: number}>`
  width: 24px;
`;

export const NameDisplayContainer = styled.span`
  margin-left: 26px;
`;
