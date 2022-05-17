/* eslint-disable no-restricted-syntax */
import {useMemo} from 'react';

import {Checkbox} from 'antd';

import {groupBy} from 'lodash';

import {ResourceSetData} from '@redux/reducers/compare';

import * as S from './ResourceList.styled';

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

type Props = {
  data: ResourceSetData;
  showCheckbox?: boolean;
};

export const ResourceList: React.FC<Props> = ({data, showCheckbox = false}) => {
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
    <S.ResourceListDiv>
      {rows.map(row => {
        if (row.type === 'header') {
          const {kind, count: resourceCount} = row;
          return (
            <S.HeaderDiv key={kind}>
              <S.Header>
                {kind} <S.ResourceCount>{resourceCount}</S.ResourceCount>
              </S.Header>
            </S.HeaderDiv>
          );
        }

        const {id, namespace, name} = row;
        return (
          <S.ResourceDiv key={id}>
            {showCheckbox ? <Checkbox style={{marginRight: 16}} disabled /> : null}
            <S.ResourceNamespace>{namespace}</S.ResourceNamespace>
            <S.ResourceName>{name}</S.ResourceName>
          </S.ResourceDiv>
        );
      })}
    </S.ResourceListDiv>
  );
};
