import styled from 'styled-components';

export const TerminalContainer = styled.div`
  width: 100%;
  height: 100%;

  & .xterm {
    height: 100%;

    & .xterm-viewport {
      overflow-y: auto;
    }
  }
`;

export const TerminalPaneContainer = styled.div`
  height: 100%;
  width: 100%;
`;
