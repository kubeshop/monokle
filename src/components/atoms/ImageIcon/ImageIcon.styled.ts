import styled from 'styled-components';

export const StyledImageIcon = styled.img<{height?: number; width?: number}>`
  height: ${props => (props.height ? `${props.height}px` : '32px')}};
  width: ${props => (props.width ? `${props.width}px` : '32px')}};
  `;
