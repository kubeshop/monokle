import styled from 'styled-components';

import Colors from '@styles/Colors';

type ItemContainerProps = {
  isSelected: boolean;
  isHighlighted: boolean;
  disableHoverStyle: boolean;
  isHovered: boolean;
  level: number;
  isLastItem: boolean;
  hasOnClick: boolean;
};

export const ItemContainer = styled.li<ItemContainerProps>`
  display: flex;
  align-items: center;
  width: 100%;
  user-select: none;
  ${props => props.hasOnClick && `cursor: pointer;`}
  ${props => {
    if (props.isLastItem) {
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
  padding-left: ${props => `${(props.level + 1) * 8 + 1}px;`};
`;

type ItemNameProps = {
  isSelected: boolean;
  isHighlighted: boolean;
  isDirty: boolean;
  isDisabled: boolean;
  level: number;
};

export const ItemName = styled.span<ItemNameProps>`
  padding: 2px 0;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  ${props => {
    if (props.isSelected) {
      return `font-weight: 700;`;
    }
    if (props.isHighlighted) {
      return `font-weight: 500;`;
    }
  }};
  ${props => {
    if (props.isDisabled) {
      return `color: ${Colors.grey7};`;
    }
    if (!props.isSelected && props.isDirty) {
      return `color: ${Colors.yellow7};`;
    }
    if (!props.isSelected && props.isHighlighted) {
      return `color: ${Colors.cyan7};`;
    }
    if (props.isSelected) {
      return `color: ${Colors.blackPure};`;
    }
    return `color: ${Colors.blue10};`;
  }};
`;

export const PrefixContainer = styled.span`
  width: 20px;
`;

export const SuffixContainer = styled.span`
  display: flex;
  align-items: center;
`;

export const QuickActionContainer = styled.span`
  margin-left: auto;
`;

export const ContextMenuContainer = styled.span`
  margin-left: auto;
`;

export const BlankSpace = styled.span`
  flex-grow: 1;
  height: 20px;
`;
