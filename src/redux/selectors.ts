import { createSelector } from 'reselect';
import { RootState } from './store';
import { isKustomizationResource } from './utils/resource';
import { PREVIEW_PREFIX } from '../constants';
import { K8sResource } from '../models/k8sresource';

export const selectAllResources = createSelector(
  (state: RootState) => state.main.resourceMap,
  resourceMap => Object.values(resourceMap),
);

export const selectActiveResources = createSelector(
  selectAllResources,
  (state: RootState) => state.main.previewResource,
  (resources, previewResource) => resources.filter(r => previewResource === undefined || r.path.startsWith(PREVIEW_PREFIX)),
);

export const selectKustomizations = createSelector(
  selectAllResources,
  resources => resources.filter((r: K8sResource) => isKustomizationResource(r)),
);

