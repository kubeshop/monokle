import path, {basename, dirname} from 'path';
import {createSelector} from 'reselect';

import {isKustomizationResource} from '@redux/services/kustomize';

import {isResourcePassingFilter} from '@utils/resources';

import {ResourceMeta} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';
import {isDefined} from '@shared/utils/filter';

import {getResourceMetaMapFromState} from './resourceMapGetters';

type HeadingNode = {
  type: 'heading';
  icon: 'kustomize' | 'command';
  subtitle?: string;
  title: string;
};

type HelmChartNode = {
  type: 'helm-chart';
  chartId: string;
};

type HelmValuesNode = {
  type: 'helm-values';
  chartId: string;
  valuesId: string;
  valuesName: string;
};

type HelmConfigNode = {
  type: 'helm-config';
  configId: string;
  configName: string;
};

type KustomizeNode = {
  type: 'kustomize';
  kustomizationId: string;
  kustomizationName: string;
};

type CommandNode = {
  type: 'command';
  commandId: string;
  commandName: string;
};

type DryRunNode = HeadingNode | HelmChartNode | HelmValuesNode | HelmConfigNode | KustomizeNode | CommandNode;

const getKustomizeFolderInfo = (str: string) => {
  const parentFolder = basename(str);

  let wasTrimmed = false;
  let anchestorFolder = str.substring(0, str.length - parentFolder.length - 1);

  if (anchestorFolder.length > 30) {
    wasTrimmed = true;
    anchestorFolder = anchestorFolder.substring(anchestorFolder.length - 30);
  }

  // remove all characters from prefix until you find the first path.sep
  anchestorFolder = anchestorFolder.substring(anchestorFolder.indexOf(path.sep));
  if (wasTrimmed) {
    anchestorFolder = `...${anchestorFolder}`;
  }

  if (anchestorFolder.trim() === '' || anchestorFolder.trim() === path.sep) {
    anchestorFolder = '<root>';
  }

  return {
    anchestorFolder,
    parentFolder,
  };
};

export const dryRunNodesSelector = createSelector(
  [
    (state: RootState) => getResourceMetaMapFromState(state, 'local'),
    (state: RootState) => state.main.helmChartMap,
    (state: RootState) => state.main.helmValuesMap,
    (state: RootState) => state.config.projectConfig?.helm?.previewConfigurationMap,
    (state: RootState) => state.config.projectConfig?.savedCommandMap,
    (state: RootState) => state.main.resourceFilter,
  ],
  (localResourceMetaMap, helmChartMap, helmValuesMap, previewConfigurationMap, savedCommandMap, filter) => {
    const list: DryRunNode[] = [];

    const kustomizationsByAnchestorFolder = Object.values(localResourceMetaMap).reduce<
      Record<string, ResourceMeta<'local'>[]>
    >((acc, resource) => {
      if (!isKustomizationResource(resource)) {
        return acc;
      }
      if (!isResourcePassingFilter(resource, filter)) {
        return acc;
      }
      const anchestorFolder = dirname(dirname(resource.origin.filePath));
      if (!acc[anchestorFolder]) {
        acc[anchestorFolder] = [];
      }
      acc[anchestorFolder].push(resource);
      return acc;
    }, {});

    Object.entries(kustomizationsByAnchestorFolder)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([parentFolderPath, kustomizations]) => {
        const {anchestorFolder, parentFolder} = getKustomizeFolderInfo(parentFolderPath);
        list.push({type: 'heading', subtitle: anchestorFolder, title: parentFolder, icon: 'kustomize'});
        kustomizations
          .sort((a, b) => a.name.localeCompare(b.name))
          .forEach(k => {
            list.push({type: 'kustomize', kustomizationId: k.id, kustomizationName: k.name});
          });
      });

    const helmCharts = Object.values(helmChartMap)
      .filter(chart => {
        if (!filter.fileOrFolderContainedIn || filter.fileOrFolderContainedIn.trim() === '') {
          return true;
        }
        if (!chart.filePath.startsWith(filter.fileOrFolderContainedIn)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    helmCharts.forEach(helmChart => {
      list.push({type: 'helm-chart', chartId: helmChart.id});
      const helmValues = helmChart.valueFileIds.map(id => helmValuesMap[id]).filter(isDefined);
      helmValues.forEach(helmValue => {
        list.push({
          type: 'helm-values',
          chartId: helmChart.id,
          valuesId: helmValue.id,
          valuesName: helmValue.name,
        });
      });

      // TODO: make sure the filtering on filePath works correctly, otherwise we will have to add chartId to the helm config
      const helmConfigs = Object.values(previewConfigurationMap ?? {})
        .filter(c => c?.helmChartFilePath === helmChart.filePath)
        .filter(isDefined)
        .sort((a, b) => a.name.localeCompare(b.name));
      helmConfigs.forEach(helmConfig => {
        list.push({
          type: 'helm-config',
          configId: helmConfig.id,
          configName: helmConfig.name,
        });
      });
    });

    const commands = Object.values(savedCommandMap ?? {})
      .filter(isDefined)
      .sort((a, b) => a.label.localeCompare(b.label));

    if (commands.length > 0) {
      list.push({type: 'heading', title: 'commands', icon: 'command'});
      commands.forEach(command => {
        list.push({
          type: 'command',
          commandId: command.id,
          commandName: command.label,
        });
      });
    }

    return list;
  }
);

export const dryRunLabelSelector = createSelector(
  [
    (state: RootState) => state.main.preview,
    (state: RootState) => getResourceMetaMapFromState(state, 'local'),
    (state: RootState) => state.main.helmChartMap,
    (state: RootState) => state.config.projectConfig?.helm?.previewConfigurationMap,
    (state: RootState) => state.config.projectConfig?.savedCommandMap,
  ],
  (preview, localResourceMetaMap, helmChartMap, previewConfigurationMap, savedCommandMap) => {
    if (!preview) {
      return undefined;
    }

    if (preview.type === 'kustomize') {
      const resource = localResourceMetaMap[preview.kustomizationId];
      return basename(resource.name);
    }

    if (preview.type === 'helm') {
      const helmChart = helmChartMap[preview.chartId];
      return helmChart?.name;
    }

    if (preview.type === 'helm-config') {
      const config = previewConfigurationMap?.[preview.configId];
      return config?.name;
    }

    if (preview.type === 'command') {
      const command = savedCommandMap?.[preview.commandId];
      return command?.label;
    }

    return undefined;
  }
);
