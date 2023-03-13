import * as k8s from '@kubernetes/client-node';

import {isAnyOf} from '@reduxjs/toolkit';

import {FSWatcher, watch} from 'chokidar';
import {isEmpty} from 'lodash';

import {AppListenerFn} from '@redux/listeners/base';
import {setAlert} from '@redux/reducers/alert';
import {CONFIG_PATH} from '@redux/services/projectConfig';
import {startClusterConnection, stopClusterConnection} from '@redux/thunks/cluster';

import {AlertEnum} from '@shared/models/alert';
import {KubeConfig, KubeConfigContext} from '@shared/models/config';

import {isProjectKubeConfigSelector} from './appConfig.selectors';
import {loadProjectKubeConfig, setKubeConfig, setOpenProject, updateProjectConfig} from './appConfig.slice';

const loadKubeConfigListener: AppListenerFn = listen => {
  listen({
    actionCreator: setKubeConfig,
    async effect(_action, {dispatch, cancelActiveListeners, getState}) {
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

        if (!isProjectKubeConfigSelector(getState())) {
          const clusterConnection = getState().main.clusterConnection;
          const currentContext = kc.currentContext;
          if (clusterConnection?.context === currentContext) {
            dispatch(
              startClusterConnection({
                context: currentContext,
                namespace: clusterConnection?.namespace,
                isRestart: true,
              })
            );

            dispatch(
              setAlert({
                type: AlertEnum.Info,
                title: 'Cluster connection',
                message: 'Kubeconfig file changed, cluster connection restarted.',
              })
            );
          } else if (clusterConnection?.context) {
            dispatch(stopClusterConnection());
            dispatch(
              setAlert({
                type: AlertEnum.Warning,
                title: 'Cluster connection',
                message: 'Current-context of the kubeconfig file changed, cluster connection stopped.',
              })
            );
          }
        }
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

      const onKubeConfigChange = () => {
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

        const clusterConnection = getState().main.clusterConnection;
        const currentContext = config.currentContext;

        if (clusterConnection?.context === currentContext) {
          dispatch(
            startClusterConnection({
              context: String(currentContext),
              namespace: clusterConnection?.namespace,
              isRestart: true,
            })
          );

          dispatch(
            setAlert({
              type: AlertEnum.Info,
              title: 'Cluster connection',
              message: 'Kubeconfig file changed, cluster connection restarted.',
            })
          );
        } else if (clusterConnection?.context) {
          dispatch(stopClusterConnection());
          dispatch(
            setAlert({
              type: AlertEnum.Warning,
              title: 'Cluster connection',
              message: 'Current-context of the kubeconfig file changed, cluster connection stopped.',
            })
          );
        }
      };

      watcher.on('unlink', event => {
        if (event === 'unlink') {
          watcher.close();
        }
      });

      watcher.on('change', onKubeConfigChange);

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
