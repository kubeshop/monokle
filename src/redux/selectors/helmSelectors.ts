import {createSelector} from '@reduxjs/toolkit';

import {orderBy} from 'lodash';

import {HelmListNode, PreviewConfigurationListNode} from '@shared/models/helm';
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

    const ordererHelmChartMap = orderBy(helmChartMap, ['name'], ['asc']).filter(
      chart => !chart.name.includes('Unnamed Chart:')
    );

    for (const helmChart of ordererHelmChartMap) {
      list.push({type: 'helm-chart', id: helmChart.id, filePath: helmChart.filePath});

      if (collapsedHelmCharts.indexOf(helmChart.id) !== -1) {
        continue;
      }

      const valuesFiles = helmChart.valueFileIds.map(id => helmValuesMap[id]).filter(isDefined);

      for (const valueFile of valuesFiles) {
        list.push({type: 'helm-value', id: valueFile.id});
      }
    }

    return list;
  }
);

export const previewConfigurationListSelector = createSelector(
  [
    (state: RootState) => state.main.helmChartMap,
    (state: RootState) => state.config.projectConfig?.helm?.previewConfigurationMap,
    (state: RootState) => state.ui.collapsedPreviewConfigurationsHelmCharts,
  ],
  (helmChartMap, previewConfigurationMap, collapsedPreviewConfigurationsHelmCharts) => {
    const list: PreviewConfigurationListNode[] = [];

    if (!previewConfigurationMap) {
      return list;
    }

    const ordererHelmChartMap = orderBy(helmChartMap, ['name'], ['asc']).filter(
      chart => !chart.name.includes('Unnamed Chart:')
    );

    const filteredPreviewConfigurations = Object.values(previewConfigurationMap).filter(entry => isDefined(entry));

    for (const helmChart of ordererHelmChartMap) {
      list.push({type: 'preview-configuration-helm-chart', id: helmChart.id, filePath: helmChart.filePath});

      if (collapsedPreviewConfigurationsHelmCharts.indexOf(helmChart.id) !== -1) {
        continue;
      }

      const previewConfigurations = orderBy(
        filteredPreviewConfigurations.filter(
          previewConfiguration => previewConfiguration?.helmChartFilePath === helmChart.filePath
        ),
        ['name'],
        ['asc']
      );

      for (const previewConfiguration of previewConfigurations) {
        if (!previewConfiguration) {
          continue;
        }

        list.push({type: 'preview-configuration', id: previewConfiguration.id});
      }
    }

    return list;
  }
);
