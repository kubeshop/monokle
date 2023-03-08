import * as k8s from '@kubernetes/client-node';

import {isAnyOf} from '@reduxjs/toolkit';

import {FSWatcher, watch} from 'chokidar';
import {isEmpty} from 'lodash';

import {AppListenerFn} from '@redux/listeners/base';
import {CONFIG_PATH} from '@redux/services/projectConfig';

import {KubeConfig, KubeConfigContext} from '@shared/models/config';

import {loadProjectKubeConfig, setKubeConfig, setOpenProject, updateProjectConfig} from './appConfig.slice';

const loadKubeConfigListener: AppListenerFn = listen => {
  listen({
    actionCreator: setKubeConfig,
    async effect(_action, {dispatch, cancelActiveListeners}) {
      // Cancel any other listeners that are listening to the same action
      cancelActiveListeners();
      const configPath = _action.payload.path;
      if (!configPath) {
        return;
      }
      try {
        const kc = new k8s.KubeConfig();
        kc.loadFromFile(configPath);
        dispatch(
          setKubeConfig({
            isPathValid: !isEmpty(kc.contexts),
            contexts: kc.contexts as KubeConfigContext[],
            currentContext: kc.getCurrentContext(),
          })
        );
      } catch (error) {
        dispatch(setKubeConfig({isPathValid: false, contexts: []}));
      }
    },
  });
};

const loadKubeConfigProjectListener: AppListenerFn = listen => {
  listen({
    actionCreator: updateProjectConfig,
    async effect(_action, {dispatch, cancelActiveListeners}) {
      // Cancel any other listeners that are listening to the same action
      cancelActiveListeners();
      const configPath = _action.payload.config?.kubeConfig?.path;
      if (!configPath) {
        return;
      }
      let config: KubeConfig;
      try {
        const kc = new k8s.KubeConfig();
        kc.loadFromFile(configPath);
        config = {
          isPathValid: !isEmpty(kc.contexts),
          contexts: kc.contexts as KubeConfigContext[],
          currentContext: kc.getCurrentContext(),
          path: configPath,
        };
      } catch (error) {
        config = {isPathValid: false, path: configPath};
      }
      dispatch(loadProjectKubeConfig(config));
    },
  });
};

const watchKubeConfigProjectListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(setOpenProject.fulfilled, updateProjectConfig),
    async effect(_action, {dispatch, getState, cancelActiveListeners, ...listenerApi}) {
      // Cancel any other listeners that are listening to the same action
      cancelActiveListeners();

      const configPath = getState().config.projectConfig?.kubeConfig?.path;
      if (!configPath) {
        return;
      }
      const absolutePath = CONFIG_PATH(configPath);

      let watcher: FSWatcher = watch(absolutePath, {
        persistent: true,
        usePolling: true,
        interval: 1000,
      });

      watcher.on('all', event => {
        if (event === 'unlink') {
          watcher.close();
        }

        let config: KubeConfig;
        try {
          const kc = new k8s.KubeConfig();
          kc.loadFromFile(configPath);
          config = {
            isPathValid: !isEmpty(kc.contexts),
            contexts: kc.contexts as KubeConfigContext[],
            currentContext: kc.getCurrentContext(),
            path: configPath,
          };
        } catch (error) {
          config = {isPathValid: false, path: configPath};
        }
        dispatch(loadProjectKubeConfig(config));
      });

      listenerApi.signal.addEventListener('abort', () => {
        watcher.close();
      });

      await listenerApi.condition(() => listenerApi.signal.aborted);
    },
  });
};

export const appConfigListeners = [
  loadKubeConfigListener,
  loadKubeConfigProjectListener,
  watchKubeConfigProjectListener,
];
