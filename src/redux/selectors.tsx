import {FolderOpenFilled} from '@ant-design/icons';

import {size} from 'lodash';
import path from 'path';
import {createSelector} from 'reselect';

import {createFileNodes, createFolderTree, sortNodes} from '@utils/fileExplorer';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AppState} from '@shared/models/appState';
import {FileEntry} from '@shared/models/fileEntry';
import {HelmValuesFile} from '@shared/models/helm';
import {RootState} from '@shared/models/rootState';
import {isFileSelection, isPreviewConfigurationSelection} from '@shared/models/selection';
import {isDefined} from '@shared/utils/filter';

import {getResourceMetaMapFromState} from './selectors/resourceMapGetters';
import {isKustomizationResource} from './services/kustomize';

export const rootFolderSelector = createSelector(
  (state: RootState) => state.main.fileMap,
  fileMap => fileMap[ROOT_FILE_ENTRY]?.filePath
);

export const selectedFilePathSelector = createSelector(
  (state: RootState) => state.main.selection,
  selection => {
    if (!isFileSelection(selection)) {
      return undefined;
    }
    return selection.filePath;
  }
);

export const selectedHelmConfigSelector = createSelector(
  [
    (state: RootState) => state.main.selection,
    (state: RootState) => state.config.projectConfig?.helm?.previewConfigurationMap,
  ],
  (selection, previewConfigurationMap) => {
    if (!isPreviewConfigurationSelection(selection)) {
      return undefined;
    }

    return previewConfigurationMap?.[selection.previewConfigurationId];
  }
);

export const previewedValuesFileSelector = createSelector(
  [(state: RootState) => state.main.preview, (state: RootState) => state.main.helmValuesMap],

  (preview, helmValuesMap) => {
    if (preview?.type !== 'helm') {
      return undefined;
    }

    return helmValuesMap[preview.valuesFileId];
  }
);

export const helmValuesMapByFilePathSelector = createSelector(
  [(state: RootState) => state.main.helmValuesMap],
  helmValuesMap => {
    return Object.values(helmValuesMap).reduce<Record<string, HelmValuesFile>>((acc, helmValuesFile) => {
      acc[helmValuesFile.filePath] = helmValuesFile;
      return acc;
    }, {});
  }
);

export const helmValuesFilesByChartNameSelector = createSelector(
  [(state: RootState) => state.main.helmChartMap, (state: RootState) => state.main.helmValuesMap],
  (helmChartMap, helmValuesMap) => {
    const helmValuesByChartName: Record<string, HelmValuesFile[]> = {};
    Object.values(helmValuesMap).forEach(helmValuesFile => {
      const helmChart = helmChartMap[helmValuesFile.helmChartId];
      if (!helmChart) {
        return;
      }
      if (!helmValuesByChartName[helmChart.name]) {
        helmValuesByChartName[helmChart.name] = [];
      }
      helmValuesByChartName[helmChart.name].push(helmValuesFile);
    });
    return Object.entries(helmValuesByChartName).sort((a, b) => a[0].localeCompare(b[0]));
  }
);

export const selectedHelmValuesSelector = createSelector(
  [(state: RootState) => state.main.selection, (state: RootState) => state.main.helmValuesMap],
  (selection, helmValuesMap) => {
    if (selection?.type !== 'helm.values.file') {
      return undefined;
    }

    return helmValuesMap[selection.valuesFileId];
  }
);

export const previewedHelmChartSelector = createSelector(
  [(state: RootState) => state.main.preview, (state: RootState) => state.main.helmChartMap],
  (preview, helmChartMap) => {
    if (preview?.type !== 'helm') {
      return undefined;
    }

    return helmChartMap[preview.chartId];
  }
);

export const previewedHelmConfigSelector = createSelector(
  [
    (state: RootState) => state.main.preview,
    (state: RootState) => state.config.projectConfig?.helm?.previewConfigurationMap,
  ],
  (preview, previewConfigurationMap) => {
    if (!preview || preview.type !== 'helm-config') {
      return undefined;
    }
    return previewConfigurationMap?.[preview.configId] ?? undefined;
  }
);

export const selectedImageSelector = createSelector(
  [(state: RootState) => state.main.selection, (state: RootState) => state.main.imageMap],
  (selection, imageMap) => {
    if (!selection || selection.type !== 'image') {
      return undefined;
    }
    return imageMap[selection.imageId];
  }
);

export const selectedImageIdSelector = createSelector(
  (state: RootState) => state.main.selection,
  selection => {
    if (!selection || selection.type !== 'image') {
      return undefined;
    }
    return selection.imageId;
  }
);

export const rootFileEntrySelector = createSelector(
  (state: RootState) => state.main.fileMap[ROOT_FILE_ENTRY],
  (rootFileEntry: FileEntry | undefined) => {
    return rootFileEntry;
  }
);

export const rootFilePathSelector = createSelector(rootFileEntrySelector, rootFileEntry => {
  return rootFileEntry?.filePath;
});

export const helmChartsSelector = createSelector(
  (state: RootState) => state.main.helmChartMap,
  helmCharts => helmCharts
);

export const helmValuesSelector = createSelector(
  (state: RootState) => state.main.helmValuesMap,
  helmValuesMap => helmValuesMap
);

export const selectHelmValues = (state: AppState, id?: string): HelmValuesFile | undefined => {
  if (!id) return undefined;
  return state.helmValuesMap[id];
};

export const selectionFilePathSelector = createSelector(
  [selectedHelmValuesSelector, selectedFilePathSelector],
  (selectedHelm, selectedFilePath) => {
    return selectedHelm?.filePath || selectedFilePath;
  }
);

export const kustomizationResourcesSelectors = createSelector(
  (state: RootState) => getResourceMetaMapFromState(state, 'local'),
  localResourceMetaMap => {
    return Object.values(localResourceMetaMap)
      .filter(i => isKustomizationResource(i))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
);

export const projectFileTreeSelector = createSelector(
  [(state: RootState) => state.main.fileMap, (state: RootState) => state.config.fileExplorerSortOrder],
  (fileMap, fileExplorerSortOrder) => {
    const rootEntry = fileMap[ROOT_FILE_ENTRY];

    const rootEntryNode = {
      key: ROOT_FILE_ENTRY,
      title: `[${path.basename(rootEntry.filePath)}]`,
      children: [],
      className: 'root-folder-tree-node',
      icon: <FolderOpenFilled />,
      isRootEntry: true,
    };

    const rootFileNodes = createFileNodes(path.sep, fileMap);
    const rootFolderNodes =
      rootEntry?.children
        ?.map(folderPath => createFolderTree(`${path.sep}${folderPath}`, fileMap, fileExplorerSortOrder))
        .filter(isDefined) || [];

    return [rootEntryNode, ...sortNodes(rootFolderNodes, rootFileNodes, fileExplorerSortOrder)];
  }
);

export const helmChartsCountSelector = createSelector([(state: RootState) => state.main.helmChartMap], helmChartMap => {
  return size(helmChartMap);
});

export const kustomizationResourcesCountSelector = createSelector(
  [kustomizationResourcesSelectors],
  kustomizationResources => {
    return size(kustomizationResources);
  }
);

export const previewLabelSelector = createSelector(
  [
    (state: RootState) => state.main.preview,
    (state: RootState) => state.main.resourceMetaMapByStorage.local,
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
      return resource?.name;
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
