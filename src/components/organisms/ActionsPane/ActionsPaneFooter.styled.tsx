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

export const TitleBarTabs = styled.div`
  display: flex;
  gap: 20px;

  & .selected-tab::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -4px;
    border: 1px solid ${Colors.grey9};
  }
`;

export const TitleLabel = styled.span`
  color: ${Colors.grey9};
  cursor: pointer;
  text-transform: uppercase;
  font-size: 12px;
  position: relative;

  &:hover::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -4px;
    border: 1px solid ${Colors.grey9};
  }
`;

export const TitleIcon = styled.span`
  color: ${Colors.grey8};
  cursor: pointer;
`;
