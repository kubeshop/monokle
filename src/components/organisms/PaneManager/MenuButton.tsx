import React, {useMemo, useState} from 'react';
import {shallowEqual} from 'react-redux';

import {Button, ButtonProps} from 'antd';

import _ from 'lodash';
import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';

import Colors from '@styles/Colors';

const StyledButton = styled(Button)<{$hasGradientBackground: boolean}>`
  display: flex;
  align-items: center;
  justify-content: center;

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

interface IMenuButtonProps extends ButtonProps {
  shouldWatchSelectedPath?: boolean;
  sectionNames?: string[];
  isSelected: boolean;
  isActive: boolean;
}

const MenuButton: React.FC<IMenuButtonProps> = props => {
  const {children, sectionNames, shouldWatchSelectedPath, isSelected, isActive, onClick, ...buttonProps} = props;

  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const sectionInstanceByName = useAppSelector(
    state => (sectionNames ? _.pick(state.navigator.sectionInstanceMap, sectionNames) : undefined),
    shallowEqual
  );

  const isAnySectionSelected = useMemo(() => {
    if (!sectionInstanceByName) {
      return false;
    }
    return Object.values(sectionInstanceByName).some(sectionInstance => sectionInstance.isSelected);
  }, [sectionInstanceByName]);

  const style: React.CSSProperties = {};

  const hasGradientBackground = useMemo(() => {
    return Boolean((isAnySectionSelected || (shouldWatchSelectedPath && selectedPath)) && (!isSelected || !isActive));
  }, [isAnySectionSelected, shouldWatchSelectedPath, selectedPath, isSelected, isActive]);

  if (hasGradientBackground) {
    if (isHovered) {
      style.background = Colors.selectionGradientHover;
    } else {
      style.background = Colors.selectionGradient;
    }
  }

  return (
    <StyledButton
      $hasGradientBackground={hasGradientBackground}
      size="large"
      type="text"
      onClick={onClick}
      icon={children}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...buttonProps}
    />
  );
};

export default MenuButton;
