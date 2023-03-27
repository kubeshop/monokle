import {size} from 'lodash';
import {createSelector} from 'reselect';

import {ImageNode} from '@shared/models/appState';
import {RootState} from '@shared/models/rootState';

export const imageListSelector = createSelector([(state: RootState) => state.main.imageMap], imageMap => {
  const list: ImageNode[] = [];

  const sortedEntries = Object.entries(imageMap).sort();

  for (const [id, image] of sortedEntries) {
    list.push({type: 'image', id, count: size(image.resourcesIds)});
  }

  return list;
});
