import styled from 'styled-components';

export const List = styled.ol`
  padding: 0;
  margin-top: 8px;
`;

export const ListItem = styled.li<{$opacity: number}>`
  margin-left: 12px;
  margin-bottom: 8px;
  width: 100%;
  opacity: ${props => props.$opacity};
`;

export const DragHandle = styled.span`
  display: inline-block;
  margin-left: auto;
  cursor: move;
`;
