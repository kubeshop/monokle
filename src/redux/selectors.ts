import { createSelector } from 'reselect';
import { RootState } from './store';
import { isKustomizationResource } from './utils/resource';
import { K8sResource } from '../models/state';

export const selectAllResources = createSelector(
  (state: RootState) => state.main.resourceMap,
  resourceMap => Object.values(resourceMap),
);

export const selectActiveResources = createSelector(
  selectAllResources,
  (state: RootState) => state.main.previewResource,
  (resources, previewResource) => resources.filter(r => previewResource === undefined || r.path.startsWith('preview://')),
);

export const selectKustomizations = createSelector(
  selectAllResources,
  resources => resources.filter((r: K8sResource) => isKustomizationResource(r)),
);

