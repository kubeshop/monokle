import React from 'react';

import {Button, Tooltip} from 'antd';

import {SwapOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';

import {compareToggled} from '@redux/compare';
import {useAppDispatch} from '@redux/hooks';

import {Walkthrough} from '@molecules';

export const CompareButton: React.FC<{width: number; children?: React.ReactNode}> = ({children, width}) => {
  const dispatch = useAppDispatch();
  const onClickClusterComparison = () => {
    dispatch(compareToggled({value: true}));
  };

  return (
    <Walkthrough collection="release" step="compare">
      <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title="Compare resources" placement="bottom">
        {width > 410 ? (
          <Button style={{padding: '4px 10px'}} type="link" onClick={onClickClusterComparison}>
            Compare & Sync
          </Button>
        ) : (
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
        )}
      </Tooltip>
    </Walkthrough>
  );
};
