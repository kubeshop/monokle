import {useCallback} from 'react';

import {Button, Checkbox, Col} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  comparisonToggled,
  diffViewOpened,
  selectComparisonListItems,
  selectIsComparisonSelected,
} from '@redux/reducers/compare';

import Colors from '@styles/Colors';

import * as S from './ComparisonList.styled';
import {ComparisonItemProps, HeaderItemProps} from './types';

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

function HeaderItem({kind, count}: HeaderItemProps) {
  return (
    <S.HeaderRow key={kind}>
      <Col span={10}>
        <S.Title useCheckboxOffset>
          {kind} <S.ResourceCount>{count}</S.ResourceCount>
        </S.Title>
      </Col>

      <Col span={4} />

      <Col span={10}>
        <S.Title>
          {kind} <S.ResourceCount>{count}</S.ResourceCount>
        </S.Title>
      </Col>
    </S.HeaderRow>
  );
}

function ComparisonItem({id, namespace, name, leftActive, rightActive, canDiff}: ComparisonItemProps) {
  const dispatch = useAppDispatch();
  const handleSelect = useCallback(() => dispatch(comparisonToggled({id})), [dispatch, id]);
  const selected = useAppSelector(state => selectIsComparisonSelected(state.compare, id));

  const handleViewDiff = useCallback(() => {
    dispatch(diffViewOpened({id}));
  }, [dispatch, id]);

  return (
    <S.ComparisonRow key={id}>
      <Col span={10}>
        <S.ResourceDiv>
          <Checkbox style={{marginRight: 16}} checked={selected} onChange={handleSelect} />
          {namespace && <S.ResourceNamespace $isActive={leftActive}>{namespace}</S.ResourceNamespace>}
          <S.ResourceName $isActive={leftActive}>{name}</S.ResourceName>
        </S.ResourceDiv>
      </Col>

      <S.ComparisonActionsCol span={4}>
        {canDiff ? (
          <Button type="primary" shape="round" size="small" onClick={handleViewDiff}>
            <S.DiffLabel>diff</S.DiffLabel>
          </Button>
        ) : (
          <Button
            type="primary"
            ghost
            style={{color: Colors.blue6}}
            shape="round"
            size="small"
            onClick={handleViewDiff}
          >
            view
          </Button>
        )}
      </S.ComparisonActionsCol>

      <Col span={10}>
        <S.ResourceDiv>
          {namespace && <S.ResourceNamespace $isActive={rightActive}>{namespace}</S.ResourceNamespace>}
          <S.ResourceName $isActive={rightActive}>{name}</S.ResourceName>
        </S.ResourceDiv>
      </Col>
    </S.ComparisonRow>
  );
}
