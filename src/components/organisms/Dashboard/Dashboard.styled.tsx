import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div`
  padding: 12px;
  display: grid;
  height: 100%;
  width: 100%;
  column-gap: 8px;
  row-gap: 8px;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 5fr 12fr;
  grid-template-areas:
    'overview overview overview'
    'status performance utilization'
    'inventory-info activity activity';
`;

export const OverviewContainer = styled.div`
  & > div:nth-child(1) {
    height: 100%;
  }
`;

export const TitleBarContainer = styled.div`
  & > div:nth-child(1) {
    height: 32px;
  }
  & > div:nth-child(2) {
    height: calc(100% - 32px);
  }
`;

export const ActionWrapper = styled.span`
  color: ${Colors.blue7};
  font-weight: 400;
  font-size: 12px;

  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;
