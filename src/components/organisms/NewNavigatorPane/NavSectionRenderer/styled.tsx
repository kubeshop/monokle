import Colors from '@styles/Colors';
import styled from 'styled-components';

type BaseContainerProps = {isSelected: boolean; isHighlighted: boolean};
const BaseContainer = styled.li<BaseContainerProps>`
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

type BaseNameProps = {isSelected: boolean; isHighlighted: boolean; level: number};
const BaseName = styled.span<BaseNameProps>`
  margin-left: ${props => `${props.level * 8}px`};
  ${props => {
    if (!props.isSelected && props.isHighlighted) {
      return `color: ${Colors.cyan7};`;
    }
    if (props.isSelected) {
      return `color: ${Colors.blackPure}`;
    }
    return `color: ${Colors.blue10}`;
  }};
`;

export const Section = {
  Container: styled(BaseContainer)``,
  Name: styled(BaseName)``,
};

export const ItemContainer = styled(BaseContainer)`
  display: flex;
  align-items: center;
`;

export const ItemName = styled(BaseName)`
  cursor: pointer;
`;

export const ItemPrefix = styled.span``;

export const ItemSuffix = styled.span``;

export const ItemContextMenu = styled.span`
  margin-left: auto;
`;
