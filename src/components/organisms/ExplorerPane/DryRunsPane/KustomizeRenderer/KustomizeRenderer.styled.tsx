import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

type ItemContainerProps = {isDisabled: boolean; isSelected: boolean; isHighlighted: boolean; isHovered: boolean};

type ItemNameProps = {
  isDisabled: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
};

export const ContextMenuPlaceholder = styled.div`
  width: 31px;
`;

export const ItemContainer = styled.span<ItemContainerProps>`
  display: flex;
  align-items: center;
  width: 100%;
  user-select: none;
  > {
    min-width: 0;
  }
  padding-left: 20px;
  padding-right: 8px;
  margin-bottom: 2px;
  cursor: pointer;

  ${props => {
    if (props.isDisabled) {
      return;
    }

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
`;

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
    if (!props.isSelected && props.isHighlighted) {
      return `color: ${Colors.cyan7};`;
    }
    if (props.isSelected) {
      return `color: ${Colors.blackPure};`;
    }
    return `color: ${Colors.blue10};`;
  }};

  padding-left: 22px;
`;

export const PrefixContainer = styled.span`
  min-width: 40px;
`;

export const SuffixContainer = styled.span`
  display: flex;
  align-items: center;
`;

export const QuickActionContainer = styled.span``;

export const ContextMenuContainer = styled.span``;
