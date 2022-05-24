import {useCallback} from 'react';

import {Button} from 'antd';

import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  CompareSide,
  selectCanTransferAllSelected,
  selectCompareStatus,
  transferResource,
} from '@redux/reducers/compare';

type Props = {
  side: CompareSide;
};

export const TransferButton: React.FC<Props> = ({side}) => {
  const dispatch = useAppDispatch();

  const isEmpty = useAppSelector(state => {
    return !state.compare.current.view.leftSet && !state.compare.current.view.rightSet;
  });
  const status = useAppSelector(state => selectCompareStatus(state.compare));
  const canTransferAllSelected = useAppSelector(state =>
    selectCanTransferAllSelected(state.compare, side === 'left' ? 'left-to-right' : 'right-to-left')
  );
  const buttonLabel = useAppSelector(state => {
    const left = state.compare.current.view.leftSet?.type;
    const right = state.compare.current.view.rightSet?.type;
    const transferTo = side === 'left' ? right : left;
    return transferTo === 'cluster' ? 'Deploy to cluster' : 'Extract to local';
  });
  const ids = useAppSelector(state => state.compare.current.selection);

  const handleTransfer = useCallback(() => {
    dispatch(transferResource({ids, direction: side === 'left' ? 'left-to-right' : 'right-to-left'}));
  }, [dispatch, ids, side]);

  if (isEmpty) {
    return null;
  }

  return (
    <Button disabled={status !== 'comparing' || !canTransferAllSelected} type="primary" onClick={handleTransfer}>
      {side === 'right' && <ArrowLeftOutlined />}
      {buttonLabel}
      {side === 'left' && <ArrowRightOutlined />}
    </Button>
  );
};
