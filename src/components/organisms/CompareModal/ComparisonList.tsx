import {useCallback} from 'react';

import {Button, Checkbox, Col} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  comparisonToggled,
  diffViewOpened,
  selectComparisonListItems,
  selectIsComparisonSelected,
} from '@redux/reducers/compare';

import * as S from './ComparisonList.styled';

export type ComparisonListItem = HeaderItemProps | ComparisonItemProps;

export const ComparisonList: React.FC = () => {
  const items = useAppSelector(state => selectComparisonListItems(state.compare));

  return (
    <div>
      {items.map(item => {
        return item.type === 'header' ? (
          <HeaderItem key={item.kind} {...item} />
        ) : (
          <ComparisonItem key={item.id} {...item} />
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
