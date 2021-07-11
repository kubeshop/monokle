import {createSelector} from 'reselect';
import {K8sResource} from '@models/k8sresource';
import {RootState} from './store';
import {isKustomizationResource} from './utils/resource';
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
  (resources, previewResource) =>
    resources.filter(r => previewResource === undefined || r.filePath.startsWith(PREVIEW_PREFIX)),
);

export const selectKustomizations = createSelector(selectAllResources, resources =>
  resources.filter((r: K8sResource) => isKustomizationResource(r)),
);

export const selectHelmCharts = createSelector(
  (state: RootState) => state.main.helmChartMap,
  helmCharts => helmCharts,
);

export const selectHelmValues = createSelector(
  (state: RootState) => state.main.helmValuesMap,
  helmValuesMap => helmValuesMap,
);

export const selectLogs = createSelector(
  (state: RootState) => state.logs.logs,
  logs => logs.join('\n'),
);
