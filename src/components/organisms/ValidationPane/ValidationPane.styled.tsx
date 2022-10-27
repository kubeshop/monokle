import styled from 'styled-components';

export const ValidationPaneContainer = styled.div<{$height: number}>`
  height: ${({$height}) => $height}px;
  overflow-y: auto;
`;
