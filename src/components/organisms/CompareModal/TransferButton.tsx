import {useCallback} from 'react';

import {Button} from 'antd';

import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';

import invariant from 'tiny-invariant';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {CompareSide, selectCanTransfer, selectCompareStatus, transferResource} from '@redux/reducers/compare';

type Props = {
  side: CompareSide;
};

export const TransferButton: React.FC<Props> = ({side}) => {
  const dispatch = useAppDispatch();

  const direction = side === 'left' ? 'left-to-right' : 'right-to-left';
  const status = useAppSelector(state => selectCompareStatus(state.compare));

  const ids = useAppSelector(state => {
    if (status === 'comparing') {
      return state.compare.current.selection;
    }
    if (status === 'inspecting') {
      invariant(state.compare.current.inspect, 'unexpected');
      return [state.compare.current.inspect.comparison];
    }
    return [];
  });
  const disabled = useAppSelector(state => {
    return !selectCanTransfer(state.compare, direction, ids);
  });

  const buttonLabel = useAppSelector(state => {
    const left = state.compare.current.view.leftSet?.type;
    const right = state.compare.current.view.rightSet?.type;
    const transferTo = side === 'left' ? right : left;
    return transferTo === 'cluster' ? 'Deploy to cluster' : 'Extract to local';
  });

  const handleTransfer = useCallback(() => {
    dispatch(transferResource({ids, direction}));
  }, [direction, dispatch, ids]);

  if (status === 'selecting') {
    return null;
  }

  return (
    <Button type="primary" onClick={handleTransfer} disabled={disabled}>
      {side === 'right' && <ArrowLeftOutlined />}
      {buttonLabel}
      {side === 'left' && <ArrowRightOutlined />}
    </Button>
  );
};
