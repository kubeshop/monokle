import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

export const RightButtons = styled.div`
  display: flex;
  align-items: center;
`;

export const TitleBarContainer = styled.div`
  width: 100%;
  border-bottom: 1px solid ${Colors.blackPure}
  position: relative;
  padding:0;
`;

export const ArrowIcon = styled.span`
  display: flex !important;
  align-items: center;

  &: after {
    right: 3px;
    content: '';
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 4px 4px 4px 0;
    border-color: transparent ${Colors.whitePure} transparent;
  }
`;
