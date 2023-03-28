import {size} from 'lodash';
import {createSelector} from 'reselect';

import {isKustomizationResource} from '@redux/services/kustomize';

import {KustomizeHeaderNode, KustomizeNode} from '@shared/models/kustomize';
import {RootState} from '@shared/models/rootState';

import {getResourceMetaMapFromState} from './resourceMapGetters';

export const kustomizeListSelector = createSelector(
  [(state: RootState) => getResourceMetaMapFromState(state, 'local')],
  localResourceMetaMap => {
    const list: (KustomizeNode | KustomizeHeaderNode)[] = [];

    const sortedKustomizations = Object.values(localResourceMetaMap)
      .filter(i => isKustomizationResource(i))
      .sort((a, b) => a.name.localeCompare(b.name));

    list.push({type: 'kustomize-header', label: 'Kustomizations', count: size(sortedKustomizations)});

    for (const kustomization of sortedKustomizations) {
      list.push({type: 'kustomize', id: kustomization.id});
    }

    return list;
  }
);
