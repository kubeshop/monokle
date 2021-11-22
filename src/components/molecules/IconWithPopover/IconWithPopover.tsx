import React from 'react';

import {Button, Popover} from 'antd';

import Icon from '@components/atoms/Icon';

interface IconWithPopoverProps {
  popoverContent: React.ReactNode | (() => React.ReactNode);
  popoverTrigger: string | string[];
  isDisabled?: boolean;
  iconName?: string;
  buttonType?: 'default' | 'primary' | 'ghost' | 'dashed' | 'link' | 'text';
  iconComponent: React.ReactNode;
}

const IconWithPopover: React.FC<IconWithPopoverProps> = props => {
  const {popoverContent, popoverTrigger, isDisabled = false, iconName, buttonType = 'link', iconComponent} = props;

  const iconToDisplay = iconComponent || (iconName ? <Icon name={iconName} /> : null);

  return (
    <Popover content={isDisabled ? <span>Filter is disabled</span> : popoverContent} trigger={popoverTrigger}>
      <Button disabled={isDisabled} type={buttonType} size="small" icon={iconToDisplay} />
    </Popover>
  );
};

export default IconWithPopover;
