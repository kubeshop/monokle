import {createSelector} from '@reduxjs/toolkit';

import {groupBy, size} from 'lodash';

import {isKustomizationPatch, isKustomizationResource} from '@redux/services/kustomize';

import {KustomizeListNode} from '@shared/models/kustomize';
import {RootState} from '@shared/models/rootState';

import {getResourceMetaMapFromState} from './resourceMapGetters';

const kindNameRenderer = (kind: string) => {
  if (kind === 'Kustomization') return kind;

  return `${kind} Patches`;
};

export const kustomizeListSelector = createSelector(
  [
    (state: RootState) => getResourceMetaMapFromState(state, 'local'),
    (state: RootState) => state.ui.collapsedKustomizeKinds,
  ],
  (localResourceMetaMap, collapsedKustomizeKinds) => {
    const list: KustomizeListNode[] = [];

    const resources = Object.values(localResourceMetaMap).filter(
      resource => isKustomizationResource(resource) || isKustomizationPatch(resource)
    );

    const groups = groupBy(resources, 'kind');
    const entries = Object.entries(groups);

    for (const [kind, kindResources] of entries) {
      const collapsed = collapsedKustomizeKinds.indexOf(kind) !== -1;

      list.push({type: 'kustomize-kind', kind, label: kindNameRenderer(kind), count: size(kindResources)});

      if (collapsed) {
        continue;
      }

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
