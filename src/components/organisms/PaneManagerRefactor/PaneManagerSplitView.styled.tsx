import styled from 'styled-components';

export const LeftPane = styled.div<{$height: number; $width: number}>`
  ${({$height, $width}) => `
  width: ${$width}px;
  height: ${$height}px;
  `};
`;

export const NavPane = styled.div<{$height: number}>`
  ${({$height}) => `
    height: ${$height}px;
  `};
`;

export const SplitViewContainer = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(2, max-content);
`;
