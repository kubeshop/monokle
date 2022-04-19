import React from 'react';

import {Tooltip, TooltipProps} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';

type PaneTooltipProps = {
  show: boolean;
  mouseEnterDelay?: number;
  title: string;
  placement: TooltipProps['placement'];
  children: React.ReactNode;
};

const PaneTooltip = ({show, mouseEnterDelay = TOOLTIP_DELAY, title, placement, children}: PaneTooltipProps) => {
  return (
    <>
      {show ? (
        <Tooltip mouseEnterDelay={mouseEnterDelay} title={title} placement={placement}>
          {children}
        </Tooltip>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export default PaneTooltip;
