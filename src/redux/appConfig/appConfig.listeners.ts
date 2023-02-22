import * as k8s from '@kubernetes/client-node';

import {isEmpty, isEqual} from 'lodash';

import {AppListenerFn} from '@redux/listeners/base';

import {KubeConfig, KubeConfigContext} from '@shared/models/config';

import {loadProjectKubeConfig, setKubeConfig, updateProjectConfig} from './appConfig.slice';

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

let tempConfig: KubeConfig;

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
        };
      } catch (error) {
        config = {isPathValid: false, contexts: []};
      }
      if (!isEqual(tempConfig, config)) {
        tempConfig = config;
        dispatch(loadProjectKubeConfig(config));
      }
    },
  });
};

export const appConfigListeners = [loadKubeConfigListener, loadKubeConfigProjectListener];
