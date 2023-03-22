import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

type NameContainerProps = {
  isHovered?: boolean;
  isCheckable?: boolean;
};

export const NameContainer = styled.span<NameContainerProps>`
  display: flex;
  align-items: center;
  width: 100%;
  height: 26px;
  padding-left: 0;
  ${props => !props.isHovered && 'padding-right: 30px;'}
`;

type SectionContainerProps = {
  isSelected?: boolean;
  isHighlighted?: boolean;
  isHovered?: boolean;
  isCollapsed?: boolean;
};

export const SectionContainer = styled.li<SectionContainerProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  user-select: none;
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
  height: 26px;
`;

type NameProps = {
  $isSelected?: boolean;
  $isHighlighted?: boolean;
};

export const Name = styled.span<NameProps>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-left: 20px;
  font-weight: 600;

  cursor: pointer;

  ${props => {
    if (props.$isSelected) {
      return `color: ${Colors.blackPure};`;
    }
    return `color: ${Colors.whitePure};`;
  }}
`;

export const BlankSpace = styled.span<{level?: number}>`
  flex-grow: 1;
  height: 32px;
  cursor: pointer;
  ${props => props.level && `height: ${32 - props.level * 8}px;`}
`;
