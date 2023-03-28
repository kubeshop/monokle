import {groupBy, size} from 'lodash';
import {createSelector} from 'reselect';

import {isKustomizationPatch, isKustomizationResource} from '@redux/services/kustomize';

import {KustomizeListNode} from '@shared/models/kustomize';
import {RootState} from '@shared/models/rootState';

import {getResourceMetaMapFromState} from './resourceMapGetters';

const kindNameRenderer = (kind: string) => {
  if (kind === 'Kustomization') return kind;

  return `${kind} Patches`;
};

export const kustomizeListSelector = createSelector(
  [(state: RootState) => getResourceMetaMapFromState(state, 'local')],
  localResourceMetaMap => {
    const list: KustomizeListNode[] = [];

    const resources = Object.values(localResourceMetaMap).filter(
      resource => isKustomizationResource(resource) || isKustomizationPatch(resource)
    );

    const groups = groupBy(resources, 'kind');
    const entries = Object.entries(groups);

    for (const [kind, kindResources] of entries) {
      list.push({type: 'kustomize-kind', name: kindNameRenderer(kind), count: size(kindResources)});

      for (const resource of kindResources) {
        list.push({
          type: kind === 'Kustomization' ? 'kustomize' : 'kustomize-resource',
          identifier: {id: resource.id, storage: 'local'},
        });
      }
    }

    return list;
  }
);
