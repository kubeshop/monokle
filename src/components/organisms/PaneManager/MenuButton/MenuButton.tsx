import React, {useMemo, useState} from 'react';
import {shallowEqual} from 'react-redux';

import {ButtonProps} from 'antd';

import _ from 'lodash';

import {useAppSelector} from '@redux/hooks';

import Colors, {PanelColors} from '@styles/Colors';

import * as S from './styled';

interface IMenuButtonProps extends ButtonProps {
  shouldWatchSelectedPath?: boolean;
  sectionNames?: string[];
  isSelected: boolean;
  isActive: boolean;
}

const MenuButton: React.FC<IMenuButtonProps> = props => {
  const {
    children,
    sectionNames,
    shouldWatchSelectedPath,
    isSelected,
    isActive,
    onClick,
    style: customStyle,
    ...buttonProps
  } = props;

  const selectedPath = useAppSelector(state => state.main.selectedPath);
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

  const style: React.CSSProperties = {
    width: '100%',
    borderRadius: '0px',
    background: !isSelected || !isActive ? 'transparent' : PanelColors.toolBar,
    height: '45px',
    ...customStyle,
  };

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
    <S.StyledButton
      $hasGradientBackground={hasGradientBackground}
      $showOpenArrow={!isSelected || !isActive}
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
