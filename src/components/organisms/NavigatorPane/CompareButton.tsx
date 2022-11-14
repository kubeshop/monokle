import React from 'react';

import {Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';

import {compareToggled} from '@redux/compare';
import {useAppDispatch} from '@redux/hooks';

import {Walkthrough} from '@molecules';

import {Icon, SecondaryButton} from '@atoms';

export const CompareButton: React.FC<{width: number; children?: React.ReactNode}> = ({children, width}) => {
  const dispatch = useAppDispatch();
  const onClickClusterComparison = () => {
    dispatch(compareToggled({value: true}));
  };

  return (
    <Walkthrough collection="release" step="compare">
      <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title="Compare resources" placement="bottom">
        {width > 410 ? (
          <SecondaryButton style={{marginLeft: 10}} type="primary" size="small" onClick={onClickClusterComparison}>
            Compare & Sync
          </SecondaryButton>
        ) : (
          <SecondaryButton
            onClick={onClickClusterComparison}
            icon={<Icon name="compare" style={{fontSize: '16px'}} />}
            type="primary"
            size="small"
            style={{marginLeft: 10}}
          >
            {children}
          </SecondaryButton>
        )}
      </Tooltip>
    </Walkthrough>
  );
};
