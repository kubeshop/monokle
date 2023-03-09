/* eslint-disable no-restricted-syntax */
import {useMemo} from 'react';

import {Checkbox, Tooltip} from 'antd';

import {groupBy} from 'lodash';

import {TOOLTIP_DELAY} from '@constants/constants';
import navSectionNames from '@constants/navSectionNames';

import {getApiVersionGroup} from '@utils/resources';

import {getResourceKindHandler} from '@src/kindhandlers';

import {ResourceSetData} from '@shared/models/compare';

import * as S from './ResourceList.styled';

type HeaderItem = {
  type: 'header';
  apiVersionGroup: string;
  kind: string;
  count: number;
};

type ResourceItem = {
  type: 'resource';
  id: string;
  namespace?: string;
  name: string;
  kind: string;
};

type Props = {
  data: ResourceSetData;
  showCheckbox?: boolean;
};

const ResourceList: React.FC<Props> = ({data, showCheckbox = false}) => {
  const rows = useMemo(() => {
    const groups = groupBy(data.resources, r => `${r.kind}--${getApiVersionGroup(r)}`);

    const sortedGroups = Object.entries(groups).sort((a, b) => {
      const kindA = a[0].split('--')[0];
      const kindB = b[0].split('--')[0];

      const kindHandlerA = getResourceKindHandler(kindA);
      const kindHandlerB = getResourceKindHandler(kindB);

      if (!kindHandlerA || !kindHandlerB) {
        return 0;
      }

      const sectionsOrdering = navSectionNames.representation[navSectionNames.K8S_RESOURCES];

      const kindAIndex = sectionsOrdering.indexOf(kindHandlerA.navigatorPath[1]);
      const kindBIndex = sectionsOrdering.indexOf(kindHandlerB.navigatorPath[1]);

      // if sections are the same, order kinds alphabetically
      if (!(kindAIndex - kindBIndex)) {
        return kindA.localeCompare(kindB);
      }

      return kindAIndex - kindBIndex;
    });

    const result: Array<HeaderItem | ResourceItem> = [];

    for (const [key, resources] of sortedGroups) {
      const [kind, apiVersionGroup] = key.split('--');
      result.push({type: 'header', kind, count: resources.length, apiVersionGroup});
      const isNamespaced = getResourceKindHandler(kind)?.isNamespaced ?? true;

      for (const {id, name, namespace} of resources) {
        result.push({type: 'resource', id, name, namespace: isNamespaced ? namespace : undefined, kind});
      }
    }

    return result;
  }, [data.resources]);

  return (
    <S.ResourceListDiv>
      {rows.map((row, index) => {
        if (row.type === 'header') {
          const {kind, count: resourceCount, apiVersionGroup} = row;
          return (
            <S.HeaderDiv $index={index} $showCheckbox={showCheckbox} key={`${kind}--${apiVersionGroup}`}>
              <S.Header>
                {kind} <S.ApiVersionGroup>{apiVersionGroup}</S.ApiVersionGroup>
                <S.ResourceCount>{resourceCount}</S.ResourceCount>
              </S.Header>
            </S.HeaderDiv>
          );
        }

        const {id, namespace, name} = row;
        return (
          <S.ResourceDiv key={id}>
            {showCheckbox ? <Checkbox style={{marginRight: 16}} disabled /> : null}
            {namespace ? (
              <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={namespace}>
                <S.ResourceNamespace>{namespace}</S.ResourceNamespace>
              </Tooltip>
            ) : (
              row.kind !== 'Namespace' && <S.ResourceNamespacePlaceholder />
            )}

            <S.ResourceName>{name}</S.ResourceName>
          </S.ResourceDiv>
        );
      })}
    </S.ResourceListDiv>
  );
};

export default ResourceList;
