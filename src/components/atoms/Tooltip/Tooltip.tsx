import {Tooltip as AntdTooltip, TooltipProps} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';

export function Tooltip(props: TooltipProps) {
  return <AntdTooltip mouseEnterDelay={TOOLTIP_DELAY} {...props} />;
}
