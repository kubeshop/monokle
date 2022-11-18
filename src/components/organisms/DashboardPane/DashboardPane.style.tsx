import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div`
  padding: 16px 0px 16px 0;
`;

export const MainSection = styled.div<{$active: boolean}>`
  padding: 0 0 0 16px;
  font-size: 16px;
  line-height: 36px;
  font-weight: 600;
  cursor: pointer;

  :hover {
    background-color: ${Colors.blue9}88;
    color: ${Colors.grey6000};
  }

  ${props => `
    color: ${props.$active ? Colors.grey6000 : Colors.whitePure};
    background-color: ${props.$active ? Colors.blue9 : 'transparent'}`}
`;
export const SubSection = styled.div<{$active: boolean}>`
  padding: 0 0 0 16px;
  font-size: 14px;
  line-height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;

  :hover {
    background-color: ${Colors.blue9}88;
    color: ${Colors.grey6000};
  }

  ${props => `
    color: ${props.$active ? Colors.grey6000 : Colors.grey9};
    background-color: ${props.$active ? Colors.blue9 : 'transparent'}`}
`;
