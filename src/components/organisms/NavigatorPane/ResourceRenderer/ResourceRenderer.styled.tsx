import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

type ItemContainerProps = {
  isSelected: boolean;
  isHighlighted: boolean;
  isHovered: boolean;
  isLastItem?: boolean;
};

export const ItemContainer = styled.span<ItemContainerProps>`
  display: flex;
  align-items: center;
  width: 100%;
  user-select: none;
  > {
    min-width: 0;
  }
  padding-left: 30px;
  padding-right: 20px;
  margin-bottom: 2px;
  cursor: pointer;

  ${props => {
    if (props.isLastItem) {
      return `margin-bottom: 12px;`;
    }
  }}

  ${props => {
    if (!props.isSelected && props.isHighlighted) {
      if (props.isHovered) {
        return `background: ${Colors.highlightColorHover};`;
      }
      return `background: ${Colors.highlightColor};`;
    }
    if (props.isSelected) {
      if (props.isHovered) {
        return `background: ${Colors.selectionColorHover};`;
      }
      return `background: ${Colors.selectionColor};`;
    }
    if (props.isHovered) {
      return `background: ${Colors.blackPearl};`;
    }
  }};
  ${props => !props.isHovered && 'padding-right: 46px;'}
`;

type ItemNameProps = {
  isSelected: boolean;
  isHighlighted: boolean;
  isDirty: boolean;
  isDisabled: boolean;
};

export const ItemName = styled.div<ItemNameProps>`
  padding: 2px 0;
  font-size: 12px;
  min-width: 0;
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
  min-width: 40px;
`;

export const SuffixContainer = styled.span`
  display: flex;
  align-items: center;
`;

export const InformationContainer = styled.span`
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
