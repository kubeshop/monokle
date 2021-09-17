import Colors from '@styles/Colors';
import styled from 'styled-components';
import {Skeleton as RawSkeleton} from 'antd';

export const NameContainer = styled.li<{isSelected?: boolean; isHighlighted?: boolean; isHovered?: boolean}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  user-select: none;
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
`;

export const Name = styled.span<{isSelected?: boolean; isHighlighted?: boolean; level: number}>`
  padding: 2px 12px;
  font-size: ${props => {
    return `${24 - 4 * props.level}px;`;
  }};
  ${props => {
    if (props.isSelected) {
      return `font-weight: 700;`;
    }
    if (props.isHighlighted) {
      return `font-weight: 500;`;
    }
  }};
  ${props => {
    if (props.isSelected) {
      return `color: ${Colors.blackPure};`;
    }
    return `color: ${Colors.whitePure};`;
  }};
`;

export const Collapsible = styled.span`
  margin-left: auto;
  margin-right: 15px;
`;

export const Skeleton = styled(RawSkeleton)`
  margin: 20px;
  width: 90%;
`;
