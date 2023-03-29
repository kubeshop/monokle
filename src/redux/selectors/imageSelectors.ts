import {createSelector} from '@reduxjs/toolkit';

import {ImageNode} from '@shared/models/appState';
import {RootState} from '@shared/models/rootState';

const filterImagesBySearchedValue = (searchedValue: string, name: string) => {
  let shouldBeFiltered = true;
  const splittedSearchedValue = searchedValue.split(' ');

  for (let i = 0; i < splittedSearchedValue.length; i += 1) {
    if (!name.split(':').find(namePart => namePart.toLowerCase().includes(splittedSearchedValue[i].toLowerCase()))) {
      shouldBeFiltered = false;
      break;
    }
  }

  return shouldBeFiltered;
};

export const imageListSelector = createSelector(
  [(state: RootState) => state.main.imageMap, (state: RootState) => state.main.imagesSearchedValue ?? ''],
  (imageMap, searchValue) => {
    const list: ImageNode[] = [];

    const sortedEntries = Object.entries(imageMap)
      .filter(([key]) => filterImagesBySearchedValue(searchValue, key))
      .sort();

    for (const [id] of sortedEntries) {
      list.push({type: 'image', id});
    }

    return list;
  }
);
