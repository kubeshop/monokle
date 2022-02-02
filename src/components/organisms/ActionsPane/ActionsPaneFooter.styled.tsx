import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div`
  width: 100%;
  border-top: 1px solid ${Colors.grey3};
  padding: 10px;
`;

export const Pane = styled.div`
  margin-top: 15px;
`;

export const TitleBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const TitleLabel = styled.span`
  color: ${Colors.grey9};
`;

export const TitleIcon = styled.span`
  color: ${Colors.grey8};
  cursor: pointer;
`;
