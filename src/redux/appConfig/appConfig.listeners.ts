import * as k8s from '@kubernetes/client-node';

import {isAnyOf} from '@reduxjs/toolkit';

import {FSWatcher, watch} from 'chokidar';
import {isEmpty} from 'lodash';

import {AppListenerFn} from '@redux/listeners/base';
import {setAlert} from '@redux/reducers/alert';
import {k8sApi} from '@redux/services/K8sApi';
import {CONFIG_PATH} from '@redux/services/projectConfig';
import {getResourceKindSchema} from '@redux/services/schema';
import {startClusterConnection, stopClusterConnection} from '@redux/thunks/cluster';
import {VALIDATOR} from '@redux/validation/validator';

import {ResourceKindHandlers, readSavedCrdKindHandlers} from '@src/kindhandlers';

import {CustomSchema} from '@monokle/validation';
import {AlertEnum} from '@shared/models/alert';
import {KubeConfig, KubeConfigContext} from '@shared/models/config';
import {openKubectlProxy} from '@shared/utils/commands/kubectl';
import {getKubeAccess} from '@shared/utils/kubeclient';

import {isProjectKubeConfigSelector} from './appConfig.selectors';
import {
  loadProjectKubeConfig,
  setClusterProxyPort,
  setKubeConfig,
  setOpenProject,
  setUserDirs,
  updateClusterAccess,
  updateProjectConfig,
} from './appConfig.slice';

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
      } catch (error: any) {
        dispatch(
          setAlert({
            title: 'KUBECONFIG error',
            message: 'there was an error parsing the file.',
            type: AlertEnum.Error,
          })
        );
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
      const proxyPort = await openKubectlProxy(() => {}, {kubeConfigPath: configPath});
      dispatch(setClusterProxyPort(proxyPort));
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
      dispatch(k8sApi.util.resetApiState());
      const results = await dispatch(k8sApi.endpoints.getNamespaces.initiate({})).unwrap();
      if (config.currentContext) {
        const namespaces = await Promise.all(
          results.items.map((item: any) => {
            return getKubeAccess(item.metadata.name, String(config.currentContext), configPath);
          })
        );
        dispatch(updateClusterAccess(namespaces));
      }
    },
  });
};

const invalidateK8sApiProxy: AppListenerFn = listen => {
  listen({
    actionCreator: setClusterProxyPort,
    async effect(_action, {dispatch, cancelActiveListeners}) {
      cancelActiveListeners();
      dispatch(k8sApi.util.resetApiState());
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

const crdsPathChangedListener: AppListenerFn = listen => {
  listen({
    type: setUserDirs.type,
    effect: async (action, {getState}) => {
      const crdsDir = getState().config.userCrdsDir;

      if (crdsDir) {
        // TODO: can we avoid having this property on the window object?
        (window as any).monokleUserCrdsDir = crdsDir;
        readSavedCrdKindHandlers(crdsDir);
      }
    },
  });
};

const k8sVersionSchemaListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(setOpenProject.fulfilled),
    effect: async (action, {getState}) => {
      const state = getState().config;
      const k8sVersion = state.projectConfig?.k8sVersion || state.k8sVersion;
      const userDataDir = state.userDataDir;
      if (!userDataDir) {
        return;
      }

      const schemas: CustomSchema[] = ResourceKindHandlers.filter(h => !h.isCustom).map(kindHandler => {
        const schema = getResourceKindSchema(kindHandler.kind, k8sVersion, userDataDir);
        return {
          apiVersion: kindHandler.clusterApiVersion,
          kind: kindHandler.kind,
          schema,
        };
      });

      await VALIDATOR.bulkRegisterCustomSchemas(schemas);
    },
  });
};

export const appConfigListeners = [
  crdsPathChangedListener,
  k8sVersionSchemaListener,
  loadKubeConfigListener,
  loadKubeConfigProjectListener,
  watchKubeConfigProjectListener,
  invalidateK8sApiProxy,
];
