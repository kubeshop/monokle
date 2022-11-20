import {Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';

import {LinkButton} from '@atoms';

import {useDiff} from '@hooks/resourceHooks';

type IProps = {
  isDropdownActive?: boolean;
};

const Diff: React.FC<IProps> = props => {
  const {isDropdownActive = false} = props;

  const {diffSelectedResource, isDisabled, tooltipTitle} = useDiff();

  return (
    <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={tooltipTitle} placement="bottomLeft">
      <LinkButton
        size="small"
        type={isDropdownActive ? 'link' : 'primary'}
        onClick={diffSelectedResource}
        disabled={isDisabled}
      >
        Diff
      </LinkButton>
    </Tooltip>
  );
};

export default Diff;
