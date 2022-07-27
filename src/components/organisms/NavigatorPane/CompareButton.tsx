import React from 'react';

import {Button, Tooltip} from 'antd';

import {SwapOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';

import {compareToggled} from '@redux/compare';
import {useAppDispatch} from '@redux/hooks';

import WalkThrough from '@components/molecules/Walkthrough';

export const CompareButton: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const dispatch = useAppDispatch();
  const onClickClusterComparison = () => {
    dispatch(compareToggled({value: true}));
  };

  return (
    <WalkThrough collection="release" step="compare">
      <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title="Compare resources" placement="bottom">
        <Button
          onClick={onClickClusterComparison}
          icon={<SwapOutlined />}
          type="primary"
          ghost
          size="small"
          style={{marginLeft: 8}}
        >
          {children}
        </Button>
      </Tooltip>
    </WalkThrough>
  );
};
