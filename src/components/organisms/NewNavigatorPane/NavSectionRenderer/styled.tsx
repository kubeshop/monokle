import Colors from '@styles/Colors';
import styled from 'styled-components';
import {Skeleton as RawSkeleton} from 'antd';

export const NameContainer = styled.li<{isSelected: boolean; isHighlighted: boolean}>`
  width: 100%;
  ${props => {
    if (!props.isSelected && props.isHighlighted) {
      return `background: ${Colors.highlightGradient};`;
    }
    if (props.isSelected) {
      return `background: ${Colors.selectionGradient};`;
    }
  }};
`;

export const Name = styled.span<{isSelected: boolean; isHighlighted: boolean; level: number}>`
  padding: 2px 12px;
  color: ${Colors.whitePure};
  font-size: ${props => {
    return `${24 - 4 * props.level}px;`;
  }};
`;

export const Skeleton = styled(RawSkeleton)`
  margin: 20px;
  width: 90%;
`;
