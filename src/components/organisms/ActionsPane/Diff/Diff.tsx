import {Button, Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useDiff} from '@hooks/resourceHooks';

const Diff = () => {
  const {diffSelectedResource, isDisabled, tooltipTitle} = useDiff();

  return (
    <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={tooltipTitle} placement="bottomLeft">
      <Button size="small" type="primary" ghost onClick={diffSelectedResource} disabled={isDisabled}>
        Diff
      </Button>
    </Tooltip>
  );
};

export default Diff;
