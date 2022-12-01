import styled from 'styled-components';

import {DEFAULT_PANE_TITLE_HEIGHT} from '@constants/constants';

import {Colors} from '@shared/styles/colors';

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
  height: ${DEFAULT_PANE_TITLE_HEIGHT}px;
  width: 100%;
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
