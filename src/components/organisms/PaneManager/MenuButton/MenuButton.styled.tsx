import {Button as RawButton} from 'antd';

import {rgba} from 'polished';
import styled from 'styled-components';

import {AnimationDurations} from '@monokle-desktop/shared/styles/animations';
import {Colors} from '@monokle-desktop/shared/styles/colors';

export const Button = styled(RawButton)<{$isActive: boolean; $isSelected: boolean}>`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 0px;
  transition: none;

  & .anticon {
    transition: color ${AnimationDurations.slow};
    background-color: ${({$isActive, $isSelected}) =>
      $isSelected && $isActive ? Colors.geekblue7 : rgba('#333c3f', 0.5)};
    border-radius: 50%;
  }

  &:hover .anticon {
    color: ${({$isActive, $isSelected}) => ($isSelected && $isActive ? Colors.cyan9 : Colors.geekblue7)} !important;
  }
`;
