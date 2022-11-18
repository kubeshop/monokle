import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div`
  padding: 0 16px 16px 16px;
  display: grid;
  height: 100%;
  width: 100%;
  column-gap: 8px;
  row-gap: 8px;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 30% 70%;
  grid-template-areas:
    'status performance utilization'
    'inventory-info activity activity';
`;

export const TitleBarContainer = styled.div`
  & > div:nth-child(1) {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  & > div:nth-child(2) {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    height: calc(100% - 32px);
    overflow: auto;
    margin-top: 4px;
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
