import React from 'react';

import {Icon} from '@atoms';

import {IconNames} from '@components/atoms/Icon';

import Colors from '@styles/Colors';

const MenuIcon = (props: {
  icon?: React.ElementType;
  iconName?: IconNames;
  active: boolean;
  isSelected: boolean;
  style?: React.CSSProperties;
  className?: string;
}) => {
  const {icon: IconComponent, iconName, active, isSelected, className, style: customStyle = {}} = props;
  const {color = Colors.grey7} = customStyle;

  if (!IconComponent && !iconName) {
    throw new Error('[MenuIcon]: Either icon or iconName should be specified.');
  }

  const style = {
    fontSize: 25,
    color,
    ...customStyle,
  };

  if (active && isSelected) {
    style.color = Colors.grey7;
  }

  if (!active) {
    style.color = Colors.grey5;
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
