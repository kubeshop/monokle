/* eslint-disable no-restricted-syntax */
import {useCallback, useMemo} from 'react';

import {Button, Checkbox, Col, Row, Tag} from 'antd';

import {groupBy} from 'lodash';
import styled from 'styled-components';

import Colors, {FontColors} from '@styles/Colors';

import {Header} from '../PageHeader/styled';
import {DiffData} from './CompareState';

type HeaderItem = {
  type: 'header';
  kind: string;
  count: number;
};

type ComparisonItem = {
  type: 'comparison';
  id: string;
  namespace: string;
  name: string;
  leftActive: boolean;
  rightActive: boolean;
  canDiff: boolean;
};

const HeaderRow = styled(Row)`
  height: 28px;
  margin-left: 8px;
  font-size: 16px;
`;

const ComparisonRow = styled(Row)`
  height: 28px;
  margin-left: 8px;
  font-size: 16px;
`;

const DiffLabel = styled.span`
  color: #1f1f1f;
`;

const ResourceName = styled.span<{$isActive?: boolean}>`
  font-size: 14px;
  font-weight: 400;
  line-height: 25px;
  color: ${({$isActive = true}) => ($isActive ? Colors.whitePure : Colors.grey5b)};
`;

const ResourceCount = styled.span`
  margin-left: 6px;
  font-size: 14px;
  color: ${FontColors.grey};
`;

const ResourceDiv = styled.div`
  height: 28px;
  display: flex;
  align-items: center;
  margin-left: 8px;
`;

const ResourceNamespace = styled(Tag)`
  height: 22px;
  margin: 1px 8px 1px 0px;
  width: 72px;
  text-align: center;
  color: ${Colors.whitePure};
  font-size: 12px;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export function DiffComparisonList({data}: {data: DiffData}) {
  const rows = useMemo(() => {
    const groups = groupBy(data.comparisons, r => {
      if (r.isMatch) return r.left.kind;
      return r.left ? r.left.kind : r.right.kind;
    });
    const result: Array<HeaderItem | ComparisonItem> = [];

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

  const handleSelect = useCallback((id: string, checked: boolean) => {
    console.log('dispatch ComparisonSelected', {id, value: checked});
  }, []);

  return (
    <div>
      {rows.map(row => {
        if (row.type === 'header') {
          const {kind, count: resourceCount} = row;
          return (
            <HeaderRow key={kind}>
              <Col span={11}>
                <Header>
                  {kind} <ResourceCount>{resourceCount}</ResourceCount>
                </Header>
              </Col>

              <Col span={2} />

              <Col span={11}>
                <Header>
                  {kind} <ResourceCount>{resourceCount}</ResourceCount>
                </Header>
              </Col>
            </HeaderRow>
          );
        }

        const {id, namespace, name, leftActive, rightActive, canDiff} = row;
        return (
          <ComparisonRow key={id}>
            <Col span={11}>
              <ResourceDiv>
                <Checkbox style={{marginRight: 16}} onChange={e => handleSelect(id, e.target.checked)} />
                <ResourceNamespace>{namespace}</ResourceNamespace>
                <ResourceName $isActive={leftActive}>{name}</ResourceName>
              </ResourceDiv>
            </Col>
            <Col span={2} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {canDiff ? (
                <Button type="primary" shape="round" size="small">
                  <DiffLabel>diff</DiffLabel>
                </Button>
              ) : null}
            </Col>

            <Col span={11}>
              <ResourceDiv>
                <ResourceNamespace>{namespace}</ResourceNamespace>
                <ResourceName $isActive={rightActive}>{name}</ResourceName>
              </ResourceDiv>
            </Col>
          </ComparisonRow>
        );
      })}
    </div>
  );
}
