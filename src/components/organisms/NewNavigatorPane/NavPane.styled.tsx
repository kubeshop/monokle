import styled from 'styled-components';

export const List = styled.ol<{height: number}>`
  list-style-type: none;
  padding: 20px;
  overflow-y: auto;
  ::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
  ${props => `height: ${props.height}px;`}
`;
