/* eslint-disable no-restricted-syntax */
import {useMemo} from 'react';

import {Checkbox, Tag} from 'antd';

import {groupBy} from 'lodash';
import styled from 'styled-components';

import Colors, {FontColors} from '@styles/Colors';

import {ResourceSetData} from './CompareState';

const SetListDiv = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: scroll;
`;

const HeaderDiv = styled.div`
  height: 28px;
  margin-left: 8px;
  font-size: 16px;
`;

const Header = styled.h1`
  padding: 0;
  margin-bottom: 0px;
  font-size: 18px;
  line-height: 22px;
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

const ResourceName = styled.span<{$isActive?: boolean}>`
  font-size: 14px;
  font-weight: 400;
  line-height: 25px;
  color: ${({$isActive = true}) => ($isActive ? Colors.whitePure : Colors.grey5b)};
`;

type HeaderItem = {
  type: 'header';
  kind: string;
  count: number;
};

type ResourceItem = {
  type: 'resource';
  id: string;
  namespace: string;
  name: string;
};

export function DiffSetList({data, showCheckbox = false}: {data: ResourceSetData; showCheckbox?: boolean}) {
  const rows = useMemo(() => {
    const groups = groupBy(data.resources, r => r.kind);
    const result: Array<HeaderItem | ResourceItem> = [];

    for (const [kind, resources] of Object.entries(groups)) {
      result.push({type: 'header', kind, count: resources.length});

      for (const {id, name, namespace} of resources) {
        result.push({type: 'resource', id, name, namespace: namespace ?? 'default'});
      }
    }

    return result;
  }, [data.resources]);

  return (
    <SetListDiv>
      {rows.map(row => {
        if (row.type === 'header') {
          const {kind, count: resourceCount} = row;
          return (
            <HeaderDiv key={kind}>
              <Header>
                {kind} <ResourceCount>{resourceCount}</ResourceCount>
              </Header>
            </HeaderDiv>
          );
        }

        const {id, namespace, name} = row;
        return (
          <ResourceDiv key={id}>
            {showCheckbox ? <Checkbox style={{marginRight: 16}} disabled /> : null}
            <ResourceNamespace>{namespace}</ResourceNamespace>
            <ResourceName>{name}</ResourceName>
          </ResourceDiv>
        );
      })}
    </SetListDiv>
  );
}
