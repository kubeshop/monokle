import {createSelector} from 'reselect';
import {K8sResource} from '@models/k8sresource';
import {isKustomizationResource} from '@redux/utils/kustomize';
import {RootState} from './store';
import {PREVIEW_PREFIX, ROOT_FILE_ENTRY} from '../constants';

export const selectRootFolder = createSelector(
  (state: RootState) => state.main.fileMap,
  fileMap => fileMap[ROOT_FILE_ENTRY]?.filePath
);

export const selectAllResources = createSelector(
  (state: RootState) => state.main.resourceMap,
  resourceMap => Object.values(resourceMap)
);

export const selectActiveResources = createSelector(
  selectAllResources,
  (state: RootState) => state.main.previewResource,
  (state: RootState) => state.main.previewValuesFile,
  (resources, previewResource, previewValuesFile) =>
    resources.filter(
      r => (previewResource === undefined && previewValuesFile === undefined) || r.filePath.startsWith(PREVIEW_PREFIX)
    )
);

export const selectKustomizations = createSelector(selectAllResources, resources =>
  resources.filter((r: K8sResource) => isKustomizationResource(r))
);

export const selectHelmCharts = createSelector(
  (state: RootState) => state.main.helmChartMap,
  helmCharts => helmCharts
);

export const selectHelmValues = createSelector(
  (state: RootState) => state.main.helmValuesMap,
  helmValuesMap => helmValuesMap
);

export const inPreviewMode = createSelector(
  (state: RootState) => state.main,
  appState => Boolean(appState.previewResource) || Boolean(appState.previewValuesFile)
);

export const inClusterMode = createSelector(
  (state: RootState) => state,
  appState => appState.main.previewResource && appState.main.previewResource.endsWith(appState.config.kubeconfig)
);

export const selectLogs = createSelector(
  (state: RootState) => state.logs.logs,
  logs => logs.join('\n')
);
