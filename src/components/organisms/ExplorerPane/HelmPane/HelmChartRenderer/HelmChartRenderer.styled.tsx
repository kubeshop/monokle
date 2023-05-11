import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

type ItemContainerProps = {
  isDisabled: boolean;
  isSelected: boolean;
  isHovered: boolean;
};

type ItemNameProps = {
  isDisabled: boolean;
  isSelected: boolean;
};

export const ContextMenuContainer = styled.span``;

export const ItemContainer = styled.span<ItemContainerProps>`
  display: flex;
  align-items: center;
  width: 100%;
  user-select: none;
  > {
    min-width: 0;
  }
  padding-left: 28px;
  padding-right: 8px;
  margin-bottom: 2px;
  cursor: pointer;

  ${props => {
    if (props.isDisabled) {
      return;
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
  white-space: nowrap;

  ${props => {
    if (props.isSelected) {
      return `font-weight: 700;`;
    }

    return 'font-weight: 600';
  }};

  ${props => {
    if (props.isDisabled) {
      return `color: ${Colors.grey7};`;
    }
    if (props.isSelected) {
      return `color: ${Colors.blackPure};`;
    }
    return `color: ${Colors.grey9};`;
  }};
`;

export const PrefixContainer = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 7px;
`;

export const SuffixContainer = styled.span<{isSelected: boolean}>`
  min-width: 0;
  color: ${({isSelected}) => (isSelected ? Colors.grey4 : Colors.grey6)};
  margin-left: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
`;
