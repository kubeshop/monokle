import {createSelector} from 'reselect';
import {K8sResource} from '@models/k8sresource';
import {isKustomizationResource} from '@redux/services/kustomize';
import {PREVIEW_PREFIX, ROOT_FILE_ENTRY} from '@constants/constants';
import {RootState} from './store';

export const rootFolderSelector = createSelector(
  (state: RootState) => state.main.fileMap,
  fileMap => fileMap[ROOT_FILE_ENTRY]?.relativePath
);

export const allResourcesSelector = createSelector(
  (state: RootState) => state.main.resourceMap,
  resourceMap => Object.values(resourceMap)
);

export const activeResourcesSelector = createSelector(
  allResourcesSelector,
  (state: RootState) => state.main.previewResourceId,
  (state: RootState) => state.main.previewValuesFileId,
  (resources, previewResource, previewValuesFile) =>
    resources.filter(
      r => (previewResource === undefined && previewValuesFile === undefined) || r.fileRelativePath.startsWith(PREVIEW_PREFIX)
    )
);

export const selectedResourceSelector = createSelector(
  (state: RootState) => state.main.resourceMap,
  (state: RootState) => state.main.selectedResourceId,
  (resourceMap, selectedResourceId) => (selectedResourceId ? resourceMap[selectedResourceId] : undefined)
);

export const kustomizationsSelector = createSelector(allResourcesSelector, resources =>
  resources.filter((r: K8sResource) => isKustomizationResource(r))
);

export const helmChartsSelector = createSelector(
  (state: RootState) => state.main.helmChartMap,
  helmCharts => helmCharts
);

export const helmValuesSelector = createSelector(
  (state: RootState) => state.main.helmValuesMap,
  helmValuesMap => helmValuesMap
);

export const isInPreviewModeSelector = createSelector(
  (state: RootState) => state.main,
  appState => Boolean(appState.previewResourceId) || Boolean(appState.previewValuesFileId)
);

export const isInClusterModeSelector = createSelector(
  (state: RootState) => state,
  appState => appState.main.previewResourceId && appState.main.previewResourceId.endsWith(appState.config.kubeconfigPath)
);

export const logsSelector = createSelector(
  (state: RootState) => state.logs.logs,
  logs => logs.join('\n')
);
