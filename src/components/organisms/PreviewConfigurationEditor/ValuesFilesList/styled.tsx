import styled from 'styled-components';

import Colors from '@styles/Colors';

export const List = styled.ol`
  padding: 0;
  margin-top: 8px;
`;

export const ListItem = styled.li`
  display: flex;
  width: 100%;
  justify-content: space-between;
  border: 1px solid ${Colors.grey4};
  padding: 4px;
  padding-left: 2px;
  margin-bottom: 8px;
`;

export const DragHandle = styled.div`
  cursor: move;
  padding: 0 8px;
`;

export const ItemOrder = styled.span`
  padding: 0 8px;
  border-right: 1px solid ${Colors.grey4};
`;

export const ItemName = styled.span``;
