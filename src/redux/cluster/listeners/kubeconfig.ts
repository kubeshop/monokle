import {ipcRenderer} from 'electron';

import {createAction, isAnyOf} from '@reduxjs/toolkit';

import {setCurrentContext, setKubeConfig, setOpenProject, updateProjectConfig} from '@redux/appConfig';
import {AppListenerFn} from '@redux/listeners/base';

import {ModernKubeConfig} from '@shared/models/config';

import {selectKubeconfigPaths} from '../selectors';
import {stopWatchKubeconfig, watchKubeconfig} from '../service/kube-control';
import {kubeconfigUpdated} from '../slice';

export const startWatchingKubeconfig = createAction('cluster/startKubeConfigWatch');
export const stopWatchingKubeconfig = createAction('cluster/stopKubeConfigWatch');

export const kubeConfigListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(startWatchingKubeconfig),
    effect: async (_, {getState, dispatch, condition, unsubscribe, subscribe}) => {
      unsubscribe();

      const kubeconfigs = selectKubeconfigPaths(getState());

      const listener = (_event: any, config: ModernKubeConfig | undefined) => {
        dispatch(kubeconfigUpdated({config}));

        // start legacy actions of main slice
        if (config?.isValid) {
          dispatch(
            setKubeConfig({
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
            })
          );

          if (config?.currentContext) {
            dispatch(setCurrentContext(config.currentContext));
          }
        } else {
          dispatch(
            setKubeConfig({
              path: config?.path,
              isPathValid: false,
              contexts: [],
            })
          );
        }
        // end legacy actions
      };

      try {
        ipcRenderer.on('kubeconfig:update', listener);
        await watchKubeconfig({kubeconfigs});
        await condition(stopWatchingKubeconfig.match);
        await stopWatchKubeconfig();
        ipcRenderer.off('kubeconfig:update', listener);
      } catch (err) {
        console.error('fail listen kubeconfig', err);
      }

      subscribe();
    },
  });
};

export const kubeconfigPathUpdateListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(setKubeConfig, updateProjectConfig, setOpenProject.fulfilled),
    effect: async (_, {getState}) => {
      if (!getState().cluster.watching) {
        return;
      }

      const kubeconfigs = selectKubeconfigPaths(getState());
      await watchKubeconfig({kubeconfigs});
    },
  });
};
