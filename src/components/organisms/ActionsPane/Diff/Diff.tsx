import {Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';

import {PrimaryButton} from '@atoms';

import {useDiff} from '@hooks/resourceHooks';

const Diff: React.FC = () => {
  const {diffSelectedResource, isDisabled, tooltipTitle} = useDiff();

  return (
    <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={tooltipTitle} placement="bottomLeft">
      <PrimaryButton size="small" type="link" onClick={diffSelectedResource} disabled={isDisabled}>
        Diff
      </PrimaryButton>
    </Tooltip>
  );
};

export default Diff;
