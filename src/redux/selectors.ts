import { createSelector } from 'reselect';
import { RootState } from './store';
import { isKustomizationResource } from './utils/resource';
import { K8sResource } from '../models/state';

export const selectResources = createSelector(
  (state: RootState) => state.main.resourceMap,
  resourceMap => Object.values(resourceMap),
);

export const selectKustomizations = createSelector(
  selectResources,
  resources => resources.filter((r: K8sResource) => isKustomizationResource(r)),
);

