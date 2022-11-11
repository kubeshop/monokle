import React from 'react';

import {Icon} from '@atoms';

import {IconNames} from '@monokle-desktop/shared/models';
import {Colors} from '@monokle-desktop/shared/styles/Colors';

const MenuIcon = (props: {
  icon?: React.ElementType;
  iconName?: IconNames;
  active: boolean;
  isSelected: boolean;
  style?: React.CSSProperties;
  className?: string;
}) => {
  const {icon: IconComponent, iconName, active, isSelected, className, style: customStyle = {}} = props;
  const {color = Colors.grey9} = customStyle;

  if (!IconComponent && !iconName) {
    throw new Error('[MenuIcon]: Either icon or iconName should be specified.');
  }

  const style = {
    fontSize: 19,
    color,
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...customStyle,
  };

  if (active && isSelected) {
    style.color = Colors.cyan9;
  }

  if (IconComponent) {
    return <IconComponent className={className} style={style} />;
  }

  if (iconName) {
    return <Icon name={iconName} style={style} />;
  }

  return null;
};

export default MenuIcon;
