import * as k8s from '@kubernetes/client-node';

import {AppListenerFn} from '@redux/listeners/base';

import {KubeConfigContext} from '@shared/models/config';

import {setKubeConfig} from './appConfig.slice';

const loadKubeConfigListener: AppListenerFn = listen => {
  listen({
    actionCreator: setKubeConfig,
    async effect(_action, {dispatch, delay, signal, cancelActiveListeners}) {
      // Cancel any other listeners that are listening to the same action
      cancelActiveListeners();
      const configPath = _action.payload.path;
      if (!configPath) {
        return;
      }

      try {
        const kc = new k8s.KubeConfig();
        kc.loadFromFile(configPath);
        dispatch(setKubeConfig({isPathValid: true, contexts: kc.contexts as KubeConfigContext[]}));
      } catch (error) {
        dispatch(setKubeConfig({isPathValid: false, contexts: []}));
      }
    },
  });
};

export const appConfigListeners = [loadKubeConfigListener];
