import styled from 'styled-components';

import {Colors, FontColors} from '@shared/styles/colors';

type NameProps = {
  $isSelected?: boolean;
  $isHighlighted?: boolean;
};

type NameContainerProps = {
  isHovered?: boolean;
  isCheckable?: boolean;
};

type SectionContainerProps = {
  isSelected?: boolean;
  isHighlighted?: boolean;
  isHovered?: boolean;
  isCollapsed?: boolean;
};

export const Name = styled.span<NameProps>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-left: 20px;
  font-weight: 600;
  font-size: 15px;

  cursor: pointer;

  ${props => {
    if (props.$isSelected) {
      return `color: ${Colors.blackPure};`;
    }
    return `color: ${Colors.whitePure};`;
  }}
`;

export const KustomizationsCounter = styled.span<{selected: boolean}>`
  margin-left: 8px;
  font-size: 14px;
  cursor: pointer;
  ${props => (props.selected ? `color: ${Colors.blackPure};` : `color: ${FontColors.grey};`)}
`;

export const NameContainer = styled.span<NameContainerProps>`
  display: flex;
  align-items: center;
  width: 100%;
  height: 26px;
  padding-left: 0;
  ${props => !props.isHovered && 'padding-right: 30px;'}
`;

export const SectionContainer = styled.li<SectionContainerProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  cursor: pointer;
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
