import {createSelector} from '@reduxjs/toolkit';

import {orderBy} from 'lodash';

import {HelmChartNode} from '@shared/models/helm';
import {RootState} from '@shared/models/rootState';

export const helmChartListSelector = createSelector([(state: RootState) => state.main.helmChartMap], helmChartMap => {
  const list: HelmChartNode[] = [];

  const ordererHelmChartMap = orderBy(helmChartMap, ['name'], ['asc']);

  for (const helmChart of ordererHelmChartMap) {
    list.push({type: 'helm-chart', id: helmChart.id});
  }

  return list;
});
