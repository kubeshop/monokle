import {groupBy, size} from 'lodash';
import {createSelector} from 'reselect';

import {isKustomizationResource} from '@redux/services/kustomize';

import {KustomizeKindNode, KustomizeNode, KustomizeResourceNode} from '@shared/models/kustomize';
import {RootState} from '@shared/models/rootState';

import {getResourceMetaMapFromState} from './resourceMapGetters';

export const kustomizeListSelector = createSelector(
  [(state: RootState) => getResourceMetaMapFromState(state, 'local')],
  localResourceMetaMap => {
    const list: (KustomizeKindNode | KustomizeNode | KustomizeResourceNode)[] = [];

    const resources = Object.values(localResourceMetaMap).filter(resource => isKustomizationResource(resource));

    const groups = groupBy(resources, 'kind');
    const entries = Object.entries(groups);

    for (const [kind, kindResources] of entries) {
      list.push({type: 'kustomize-kind', name: kind, count: size(kindResources)});

      for (const resource of kindResources) {
        list.push({type: 'kustomize', identifier: {id: resource.id, storage: 'local'}});
      }
    }

    return list;
  }
);
