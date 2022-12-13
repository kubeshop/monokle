import {Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';

import {PrimaryButton} from '@atoms';

import {useDiff} from '@hooks/resourceHooks';

type IProps = {
  isDropdownActive?: boolean;
};

const Diff: React.FC<IProps> = props => {
  const {isDropdownActive = false} = props;

  const {diffSelectedResource, isDisabled, tooltipTitle} = useDiff();

  return (
    <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={tooltipTitle} placement="bottomLeft">
      <PrimaryButton
        size="small"
        type={isDropdownActive ? 'link' : 'primary'}
        onClick={diffSelectedResource}
        disabled={isDisabled}
      >
        Diff
      </PrimaryButton>
    </Tooltip>
  );
};

export default Diff;
