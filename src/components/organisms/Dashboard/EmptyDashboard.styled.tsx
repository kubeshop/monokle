import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  height: 100%;
`;

export const Image = styled.img<{$right?: number}>`
  position: absolute;
  right: ${({$right = 108}) => `${$right}px`};
  top: 45px;
`;
