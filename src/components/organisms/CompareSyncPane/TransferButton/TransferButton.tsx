import {useCallback, useMemo} from 'react';

import {Button} from 'antd';

import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';

import invariant from 'tiny-invariant';

import {selectCanTransfer, selectCompareStatus, transferResource} from '@redux/compare';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {CompareSide} from '@shared/models/compare';

type Props = {
  side: CompareSide;
};

const TransferButton: React.FC<Props> = ({side}) => {
  const dispatch = useAppDispatch();

  const compareState = useAppSelector(state => state.compare);
  const direction = side === 'left' ? 'left-to-right' : 'right-to-left';
  const status = useAppSelector(state => selectCompareStatus(state.compare));

  const ids = useMemo(() => {
    if (status === 'comparing') {
      return compareState.current.selection;
    }
    if (status === 'inspecting') {
      invariant(compareState.current.inspect, 'unexpected');
      return [compareState.current.inspect.comparison];
    }
    return [];
  }, [compareState, status]);

  const buttonLabel = useMemo(() => {
    const left = compareState.current.view.leftSet?.type;
    const right = compareState.current.view.rightSet?.type;
    const transferTo = side === 'left' ? right : left;
    return transferTo === 'cluster' ? 'Deploy to cluster' : 'Extract to local';
  }, [compareState, side]);
  const disabled = useMemo(() => {
    return !selectCanTransfer(compareState, direction, ids);
  }, [direction, ids, compareState]);

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

export default TransferButton;
