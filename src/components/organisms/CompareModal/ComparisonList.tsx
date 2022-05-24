import {useCallback} from 'react';

import {Button, Checkbox, Col} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  CompareSide,
  comparisonInspecting,
  comparisonToggled,
  selectComparisonListItems,
  selectIsComparisonSelected,
} from '@redux/reducers/compare';

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

  const handleInspect = useCallback(
    (type: CompareSide | 'diff') => {
      dispatch(comparisonInspecting({comparison: id, type}));
    },
    [dispatch, id]
  );

  return (
    <S.ComparisonRow key={id}>
      <Col span={10}>
        <S.ResourceDiv>
          <Checkbox style={{marginRight: 16}} checked={selected} onChange={handleSelect} />
          {namespace && <S.ResourceNamespace $isActive={leftActive}>{namespace}</S.ResourceNamespace>}
          <S.ResourceName $isActive={leftActive} onClick={leftActive ? () => handleInspect('left') : undefined}>
            {name}
          </S.ResourceName>
        </S.ResourceDiv>
      </Col>

      <S.ComparisonActionsCol span={4}>
        {canDiff && (
          <Button type="primary" shape="round" size="small" onClick={() => handleInspect('diff')}>
            <S.DiffLabel>diff</S.DiffLabel>
          </Button>
        )}
      </S.ComparisonActionsCol>

      <Col span={10}>
        <S.ResourceDiv>
          {namespace && <S.ResourceNamespace $isActive={rightActive}>{namespace}</S.ResourceNamespace>}
          <S.ResourceName $isActive={rightActive} onClick={rightActive ? () => handleInspect('right') : undefined}>
            {name}
          </S.ResourceName>
        </S.ResourceDiv>
      </Col>
    </S.ComparisonRow>
  );
}
