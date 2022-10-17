import {Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useDiff} from '@hooks/resourceHooks';

import * as S from '../ActionsPaneHeader.styled';

const Diff = () => {
  const {diffSelectedResource, isDisabled, tooltipTitle} = useDiff();

  return (
    <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={tooltipTitle} placement="bottomLeft">
      <S.PrimaryButton size="small" type="primary" onClick={diffSelectedResource} disabled={isDisabled}>
        Diff
      </S.PrimaryButton>
    </Tooltip>
  );
};

export default Diff;
