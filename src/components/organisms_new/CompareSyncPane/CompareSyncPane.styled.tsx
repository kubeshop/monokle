import styled from 'styled-components';

import Colors from '@styles/Colors';

export const CompareSyncPaneContainer = styled.div`
  padding: 10px;
  background-color: ${Colors.grey10};
  height: 100%;
  width: 100%;
`;

export const Content = styled.div`
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
`;
