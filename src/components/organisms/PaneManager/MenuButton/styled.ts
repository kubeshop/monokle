import {Button} from 'antd';

import styled from 'styled-components';

import Colors, {PanelColors} from '@styles/Colors';

export const StyledButton = styled(Button)<{$hasGradientBackground: boolean; $showOpenArrow: boolean}>`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 0px;

  ${props => {
    if (!props.$showOpenArrow) {
      return ` background-color: ${PanelColors.toolBar} !important;
            `;
    }
    if (props.$showOpenArrow) {
      return `
      &:hover {
        &: after {
          position: absolute;
          right: 3px;
          top: 50%;
          content: '';
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 4px 0 4px 4px;
          border-color: transparent transparent transparent ${Colors.grey8};
        }
      }`;
    }
  }}

  ${props => {
    if (props.$hasGradientBackground) {
      return `& .anticon {
        color: ${Colors.blackPure} !important;
      }`;
    }
  }}

  & .anticon {
    transition: all 0.2s ease-in;
  }

  ${props => `
    &:hover {
      & .anticon {
        color: ${props.$hasGradientBackground ? Colors.grey5 : Colors.grey8} !important;
      }
    }
  `}
`;
