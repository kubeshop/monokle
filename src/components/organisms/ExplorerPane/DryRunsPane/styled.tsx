import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

type ItemContainerProps = {
  isDisabled?: boolean;
  isPreviewed: boolean;
  isHighlighted?: boolean;
  isHovered: boolean;
  indent?: number;
};

type ItemNameProps = {
  isDisabled?: boolean;
  isHighlighted?: boolean;
  isPreviewed: boolean;
};

export const ItemContainer = styled.span<ItemContainerProps>`
  display: flex;
  align-items: center;
  width: 100%;
  user-select: none;
  > {
    min-width: 0;
  }
  padding-left: ${props => `${20 + (props.indent ?? 0)}px`};
  padding-right: 8px;
  margin-bottom: 2px;
  cursor: pointer;

  ${props => {
    if (props.isDisabled) {
      return;
    }

    if (!props.isPreviewed && props.isHighlighted) {
      if (props.isHovered) {
        return `background: ${Colors.highlightColorHover};`;
      }
      return `background: ${Colors.highlightColor};`;
    }
    if (props.isPreviewed) {
      if (props.isHovered) {
        return `background: ${Colors.dryRunHover};`;
      }
      return `background: ${Colors.dryRun};`;
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
    if (props.isPreviewed) {
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
    if (!props.isPreviewed && props.isHighlighted) {
      return `color: ${Colors.cyan7};`;
    }
    if (props.isPreviewed) {
      return `color: ${Colors.blackPure};`;
    }
    return `color: ${Colors.blue10};`;
  }};
`;
