import {has, size} from 'lodash';
import {createSelector} from 'reselect';

import {RootState} from '../models/rootState';
import {selectKubeContext} from './cluster/selectors';

export const transientResourceCountSelector = createSelector(
  // TODO: could we memoize this for only the count? maybe a new `createCountSelector`?
  (state: Pick<RootState, 'main'> & {main: Pick<RootState['main'], 'resourceMetaMapByStorage'>}) =>
    state.main.resourceMetaMapByStorage.transient,
  transientMetaStorage => {
    return size(transientMetaStorage);
  }
);

export const isInClusterModeSelector = createSelector(
  selectKubeContext,
  (state: RootState) => state.main.clusterConnection?.context,
  (context, clusterConnectionContext): boolean => {
    return context !== undefined && clusterConnectionContext !== undefined && clusterConnectionContext === context.name;
  }
);

export const isInPreviewModeSelector = createSelector(
  (state: Pick<RootState, 'main'> & {main: Pick<RootState['main'], 'preview'>}) => state?.main?.preview,
  preview => {
    return Boolean(preview);
  }
);

export const activeProjectSelector = createSelector(
  [
    (state: Pick<RootState, 'config'> & {config: Pick<RootState['config'], 'projects'>}) => state.config.projects,
    (state: Pick<RootState, 'config'> & {config: Pick<RootState['config'], 'selectedProjectRootFolder'>}) =>
      state.config.selectedProjectRootFolder,
  ],
  (projects, selectedProjectRootFolder) => projects.find(p => p.rootFolder === selectedProjectRootFolder)
);

export const kubeConfigPathValidSelector = createSelector(
  [(state: RootState) => state.config.projectConfig?.kubeConfig, (state: RootState) => state.config.kubeConfig],
  (projectKubeConfig, globalKubeConfig) => {
    if (has(projectKubeConfig, 'isPathValid')) {
      return Boolean(projectKubeConfig?.isPathValid);
    }

    return Boolean(globalKubeConfig.isPathValid);
  }
);

export const kubeConfigPathSelector = createSelector(
  [
    (state: RootState) => state.config.projectConfig?.kubeConfig?.path,
    (state: RootState) => state.config.kubeConfig.path,
  ],
  (projectKubeConfigPath, kubeConfigPath) => projectKubeConfigPath ?? kubeConfigPath ?? undefined
);
