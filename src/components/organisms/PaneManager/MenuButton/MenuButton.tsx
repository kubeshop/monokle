import React from 'react';

import {ButtonProps} from 'antd';

import {PanelColors} from '@shared/styles/colors';

import * as S from './MenuButton.styled';

interface IMenuButtonProps extends ButtonProps {
  isSelected: boolean;
  isActive: boolean;
}

const MenuButton: React.FC<IMenuButtonProps> = props => {
  const {children, isSelected, isActive, onClick, style: customStyle, ...buttonProps} = props;

  const style: React.CSSProperties = {
    width: '100%',
    borderRadius: '0px',
    background: !isSelected || !isActive ? 'transparent' : PanelColors.toolBar,
    height: '50px',
    ...customStyle,
  };

  return (
    <S.Button
      $isActive={isActive}
      $isSelected={isSelected}
      type="text"
      onClick={onClick}
      icon={children}
      style={style}
      {...buttonProps}
    />
  );
};

export default MenuButton;
