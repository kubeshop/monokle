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
  isInitialized?: boolean;
  disableHoverStyle?: boolean;
  isSectionCheckable?: boolean;
  hasCustomNameDisplay?: boolean;
  $marginBottom?: number;
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
  ${props => `margin-bottom: ${props.$marginBottom || 0}px;`}
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
  $nameColor?: string;
  $fontSize: number;
  $nameWeight?: number;
};

export const Name = styled.span<NameProps>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  ${props => {
    return `font-size: ${props.$fontSize}px;`;
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
  cursor: pointer;
  ${props => (props.selected ? `color: ${Colors.blackPure};` : `color: ${FontColors.grey};`)}
`;

export const EmptyDisplayContainer = styled.div`
  margin-left: 16px;
`;

export const BeforeInitializationContainer = styled.div`
  padding-top: 16px;
  margin-left: 16px;
`;

export const BlankSpace = styled.span<{$height: number}>`
  flex-grow: 1;
  height: 32px;
  cursor: pointer;
  ${props => `height: ${props.$height}px;`}
`;

export const Checkbox = styled(RawCheckbox)`
  margin-left: -16px;
`;

export const CheckboxPlaceholder = styled.span`
  width: 24px;
`;

export const NameDisplayContainer = styled.span`
  margin-left: 26px;
`;
