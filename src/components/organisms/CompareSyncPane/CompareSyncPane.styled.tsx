import {Row} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const ActionsRow = styled(Row)`
  margin-top: 20px;
  align-items: center;
`;

export const CompareSyncPaneContainer = styled.div`
  padding: 10px;
  background-color: ${Colors.grey10};
  height: 100%;
  width: 100%;
  overflow: auto;
  scrollbar-gutter: stable both-edges;
`;

export const Content = styled.div<{$hasSideSelected: boolean}>`
  padding-top: 8px;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;

  scrollbar-gutter: ${({$hasSideSelected}) => ($hasSideSelected ? 'stable' : 'none')};
`;
