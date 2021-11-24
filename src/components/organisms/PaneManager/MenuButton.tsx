import React, {useMemo, useState} from 'react';
import {shallowEqual} from 'react-redux';

import {Button} from 'antd';

import _ from 'lodash';
import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';

import Colors from '@styles/Colors';

const StyledButton = styled(Button)<{isHovered: boolean; hasGradientBackground: boolean}>`
  ${props => {
    if (props.hasGradientBackground) {
      return `& .anticon {
        color: ${Colors.blackPure} !important;
      }`;
    }
    if (props.isHovered) {
      return `& .anticon {
        color: ${Colors.grey400} !important;
      }`;
    }
  }}
`;

const MenuButton: React.FC<{sectionNames?: string[]; isSelected: boolean; onClick: () => void}> = props => {
  const {children, sectionNames, isSelected, onClick} = props;

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

  if (isAnySectionSelected && !isSelected) {
    if (isHovered) {
      style.background = Colors.selectionGradientHover;
    } else {
      style.background = Colors.selectionGradient;
    }
  }

  return (
    <StyledButton
      isHovered={isHovered}
      hasGradientBackground={isAnySectionSelected && !isSelected}
      size="large"
      type="text"
      onClick={onClick}
      icon={children}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
};

export default MenuButton;
