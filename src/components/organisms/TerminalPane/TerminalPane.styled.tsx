import styled from 'styled-components';

export const TerminalContainer = styled.div<{$height: number}>`
  width: 100%;
  height: ${({$height}) => $height}px;

  & .xterm {
    height: 100%;

    & .xterm-viewport {
      overflow-y: auto;
    }
  }
`;

export const TerminalPaneContainer = styled.div<{$height: number}>`
  height: ${({$height}) => $height}px;
  width: 100%;
  padding: 10px;
`;
