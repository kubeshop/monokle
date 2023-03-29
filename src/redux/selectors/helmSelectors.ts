import {createSelector} from '@reduxjs/toolkit';

import {orderBy} from 'lodash';

import {HelmListNode} from '@shared/models/helm';
import {RootState} from '@shared/models/rootState';
import {isDefined} from '@shared/utils/filter';

export const helmChartListSelector = createSelector(
  [
    (state: RootState) => state.main.helmChartMap,
    (state: RootState) => state.main.helmValuesMap,
    (state: RootState) => state.ui.collapsedHelmCharts,
  ],
  (helmChartMap, helmValuesMap, collapsedHelmCharts) => {
    const list: HelmListNode[] = [];

    const ordererHelmChartMap = orderBy(helmChartMap, ['name'], ['asc']);

    for (const helmChart of ordererHelmChartMap) {
      list.push({type: 'helm-chart', id: helmChart.id, filePath: helmChart.filePath});

      if (collapsedHelmCharts.indexOf(helmChart.id) !== -1) {
        continue;
      }

      const valuesFiles = helmChart.valueFileIds.map(id => helmValuesMap[id]).filter(isDefined);

      for (const valueFile of valuesFiles) {
        list.push({type: 'helm-value', id: valueFile.id});
        list.push({type: 'helm-value', id: valueFile.id});
        list.push({type: 'helm-value', id: valueFile.id});
        list.push({type: 'helm-value', id: valueFile.id});
        list.push({type: 'helm-value', id: valueFile.id});
      }
    }

    return list;
  }
);
