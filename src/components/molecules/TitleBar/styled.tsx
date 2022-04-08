import styled from 'styled-components';

import {AppBorders} from '@styles/Borders';
import Colors from '@styles/Colors';

export const Container = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

export const RightButtons = styled.div`
  display: flex;
  align-items: center;
  margin-left: 15px;
`;

export const TitleBarContainer = styled.div`
  width: 100%;
  border-bottom: ${AppBorders.sectionDivider};
  position: relative;
`;

export const ArrowIcon = styled.span`
  display: flex !important;
  align-items: center;

  &: after {
    right: 3px;
    top: 50%;
    content: '';
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 4px 4px 4px 0;
    border-color: transparent ${Colors.whitePure} transparent;
  }
`;
