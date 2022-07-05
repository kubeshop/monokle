import React, {useEffect} from 'react';

import {Button, Tooltip} from 'antd';

import {SwapOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';

import {compareToggled} from '@redux/compare';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {kubeConfigPathValidSelector} from '@redux/selectors';

import WalkThrough from '@components/molecules/WalkThrough';

export const CompareButton: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  useEffect(() => {
    isCompareDisabled();
  }, [isKubeConfigPathValid]);
  const dispatch = useAppDispatch();
  const isCompareDisabled = () => {
    if (!isKubeConfigPathValid) {
      return true;
    }
  };
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
          disabled={isCompareDisabled()}
          style={{marginLeft: 8}}
        >
          {children}
        </Button>
      </Tooltip>
    </WalkThrough>
  );
};
