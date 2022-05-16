/* eslint-disable no-restricted-syntax */
import {useCallback, useMemo} from 'react';

import {Button, Checkbox, Col} from 'antd';

import {groupBy} from 'lodash';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {ComparisonData, comparisonToggled, diffViewOpened, selectIsComparisonSelected} from '@redux/reducers/compare';

import * as S from './ComparisonList.styled';

type Props = {
  data: ComparisonData;
};

export const ComparisonList: React.FC<Props> = ({data}) => {
  const rows = useMemo(() => {
    const groups = groupBy(data.comparisons, r => {
      if (r.isMatch) return r.left.kind;
      return r.left ? r.left.kind : r.right.kind;
    });
    const result: Array<HeaderItemProps | ComparisonItemProps> = [];

    for (const [kind, comparisons] of Object.entries(groups)) {
      result.push({type: 'header', kind, count: comparisons.length});

      for (const comparison of comparisons) {
        if (comparison.isMatch) {
          result.push({
            type: 'comparison',
            id: comparison.id,
            name: comparison.left.name,
            namespace: comparison.left.namespace ?? 'default',
            leftActive: true,
            rightActive: true,
            canDiff: comparison.isDifferent,
          });
        } else {
          result.push({
            type: 'comparison',
            id: comparison.id,
            name: comparison.left?.name ?? comparison.right?.name ?? 'unknown',
            namespace: comparison.left?.namespace ?? comparison.right?.namespace ?? 'default',
            leftActive: Boolean(comparison.left),
            rightActive: Boolean(comparison.right),
            canDiff: false,
          });
        }
      }
    }

    return result;
  }, [data.comparisons]);

  return (
    <div>
      {rows.map(row => {
        return row.type === 'header' ? (
          <HeaderItem key={row.kind} {...row} />
        ) : (
          <ComparisonItem key={row.id} {...row} />
        );
      })}
    </div>
  );
};

type HeaderItemProps = {
  type: 'header';
  kind: string;
  count: number;
};

function HeaderItem({kind, count}: HeaderItemProps) {
  return (
    <S.HeaderRow key={kind}>
      <Col span={11}>
        <S.Title>
          {kind} <S.ResourceCount>{count}</S.ResourceCount>
        </S.Title>
      </Col>

      <Col span={2} />

      <Col span={11}>
        <S.Title>
          {kind} <S.ResourceCount>{count}</S.ResourceCount>
        </S.Title>
      </Col>
    </S.HeaderRow>
  );
}

type ComparisonItemProps = {
  type: 'comparison';
  id: string;
  namespace: string;
  name: string;
  leftActive: boolean;
  rightActive: boolean;
  canDiff: boolean;
};

function ComparisonItem({id, namespace, name, leftActive, rightActive, canDiff}: ComparisonItemProps) {
  const dispatch = useAppDispatch();
  const handleSelect = useCallback(() => dispatch(comparisonToggled({id})), [dispatch, id]);
  const selected = useAppSelector(state => selectIsComparisonSelected(state.compare, id));

  const handleViewDiff = useCallback(() => {
    dispatch(diffViewOpened({id}));
  }, [dispatch, id]);

  return (
    <S.ComparisonRow key={id}>
      <Col span={11}>
        <S.ResourceDiv>
          <Checkbox style={{marginRight: 16}} checked={selected} onChange={handleSelect} />
          <S.ResourceNamespace>{namespace}</S.ResourceNamespace>
          <S.ResourceName $isActive={leftActive}>{name}</S.ResourceName>
        </S.ResourceDiv>
      </Col>
      <Col span={2} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {canDiff ? (
          <Button type="primary" shape="round" size="small" onClick={handleViewDiff}>
            <S.DiffLabel>diff</S.DiffLabel>
          </Button>
        ) : null}
      </Col>

      <Col span={11}>
        <S.ResourceDiv>
          <S.ResourceNamespace>{namespace}</S.ResourceNamespace>
          <S.ResourceName $isActive={rightActive}>{name}</S.ResourceName>
        </S.ResourceDiv>
      </Col>
    </S.ComparisonRow>
  );
}
