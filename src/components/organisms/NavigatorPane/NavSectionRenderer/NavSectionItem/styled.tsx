import Colors from '@styles/Colors';
import styled from 'styled-components';

export const ItemContainer = styled.li<{
  isSelected: boolean;
  isHighlighted: boolean;
  isVisible: boolean;
  isHovered: boolean;
  level: number;
  isLastItem: boolean;
}>`
  display: flex;
  align-items: center;
  width: 100%
  cursor: pointer;
  user-select: none;
    ${props => {
      if (props.isLastItem) {
        return `margin-bottom: 12px;`;
      }
    }}
    ${props => {
      if (props.isVisible) {
        return 'transition: opacity 500ms ease-in;';
      }
      return 'transition: opacity 500ms ease-out;';
    }}
    ${props => {
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
  padding-left: ${props => `${props.level * 12}px;`};
`;

export const ItemName = styled.span<{
  isSelected: boolean;
  isHighlighted: boolean;
  isDirty: boolean;
  isDisabled: boolean;
  level: number;
}>`
  padding: 2px 0;
  cursor: pointer;
  font-size: 12px;
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
