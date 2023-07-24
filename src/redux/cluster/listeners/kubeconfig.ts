import {ipcRenderer} from 'electron';

import isEqual from 'react-fast-compare';

import {createAction, isAnyOf} from '@reduxjs/toolkit';

import {cloneDeep} from 'lodash';
import log from 'loglevel';

import {
  kubeConfigPathSelector,
  loadProjectKubeConfig,
  setCurrentContext,
  setKubeConfig,
  updateProjectConfig,
} from '@redux/appConfig';
import {AppListenerFn} from '@redux/listeners/base';
import {setOpenProject} from '@redux/thunks/project';

import {KubeConfig, ModernKubeConfig} from '@shared/models/config';

import {selectKubeconfigPaths} from '../selectors';
import {getEnvKubeconfigs, stopWatchKubeconfig, watchKubeconfig} from '../service/kube-control';
import {kubeconfigPathsUpdated, kubeconfigUpdated} from '../slice';

export const startWatchingKubeconfig = createAction('cluster/startKubeConfigWatch');
export const stopWatchingKubeconfig = createAction('cluster/stopKubeConfigWatch');

export const kubeConfigListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(startWatchingKubeconfig),
    effect: async (_, {getState, dispatch, condition, unsubscribe, subscribe}) => {
      unsubscribe();

      const ENV_KUBECONFIGS = await getEnvKubeconfigs();
      const kubeconfigs = [...ENV_KUBECONFIGS, ...selectKubeconfigPaths(getState())];

      const listener = (_event: any, config: ModernKubeConfig | undefined) => {
        const oldConfig = config ? getState().cluster.kubeconfigs[config.path] : undefined;
        const hasChanged = !isEqual(oldConfig, config);
        if (hasChanged || !config?.isValid) {
          dispatch(kubeconfigUpdated({config}));
        }

        // start legacy actions of main slice
        const newKubeconfig: KubeConfig = config?.isValid
          ? {
              contexts:
                config?.contexts.map(c => ({
                  cluster: c.cluster,
                  name: c.name,
                  namespace: c.namespace ?? null,
                  user: c.user,
                })) ?? [],
              currentContext: config?.currentContext,
              isPathValid: true,
              path: config?.path,
            }
          : {
              path: config?.path,
              isPathValid: false,
              contexts: [],
            };

        const isInitKubeconfig = getState().config.kubeConfig.path === undefined;
        if (isInitKubeconfig) {
          dispatch(setKubeConfig(newKubeconfig));
        }

        const isGlobalKubeconfig = getState().config.kubeConfig.path === config?.path;
        if (isGlobalKubeconfig) {
          const oldKubeconfig = cloneDeep(getState().config.kubeConfig);

          if (!oldKubeconfig.isPathValid && oldKubeconfig.currentContext) {
            delete oldKubeconfig.currentContext;
          }

          const changed = !isEqual(newKubeconfig, oldKubeconfig);
          if (changed) {
            dispatch(setKubeConfig(newKubeconfig));
          }
        }

        const isProjectKubeconfig = getState().config.projectConfig?.kubeConfig?.path === config?.path;
        if (isProjectKubeconfig) {
          const oldKubeconfig: KubeConfig | undefined = getState().config.projectConfig?.kubeConfig;
          const changed = !isEqual(newKubeconfig, oldKubeconfig);
          if (changed) dispatch(loadProjectKubeConfig(newKubeconfig));
        }

        if (config?.isValid && config?.currentContext) {
          const currentPath = kubeConfigPathSelector(getState());
          const isCurrentConfig = config.path === currentPath;
          if (isCurrentConfig) {
            // WARNING: this might be incorrect.
            // setCurrentContext always updates global kubeconfig and not project kubeconfig.
            dispatch(setCurrentContext(config.currentContext));
          }
        }
        // end legacy actions
      };

      try {
        dispatch(kubeconfigPathsUpdated({kubeconfigs}));
        ipcRenderer.on('kubeconfig:update', listener);
        await watchKubeconfig({kubeconfigs});
        await condition(stopWatchingKubeconfig.match);
        await stopWatchKubeconfig();
        ipcRenderer.off('kubeconfig:update', listener);
      } catch (err) {
        log.error('Cannot watch kubeconfigs.', err);
      }

      subscribe();
    },
  });
};

export const kubeconfigPathUpdateListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(setKubeConfig, updateProjectConfig, setOpenProject.fulfilled),
    effect: async (_, {getState, dispatch}) => {
      if (!getState().cluster.watching) {
        return;
      }

      const ENV_KUBECONFIG = await getEnvKubeconfigs();
      const kubeconfigs = [...ENV_KUBECONFIG, ...selectKubeconfigPaths(getState())];
      dispatch(kubeconfigPathsUpdated({kubeconfigs}));
      await watchKubeconfig({kubeconfigs});
    },
  });
};
