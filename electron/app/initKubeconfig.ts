import * as k8s from '@kubernetes/client-node';

import path from 'path';
import {AnyAction} from 'redux';

import {AlertEnum} from '@monokle-desktop/shared/models/alert';
import type {KubeConfig, KubeConfigContext} from '@monokle-desktop/shared/models/config';
import electronStore from '@monokle-desktop/shared/utils/electronStore';

function initKubeconfig(dispatch: (action: AnyAction) => void, userHomeDir: string) {
  if (process.env.KUBECONFIG) {
    const envKubeconfigParts = process.env.KUBECONFIG.split(path.delimiter);
    if (envKubeconfigParts.length > 1) {
      dispatch({type: 'config/setKubeConfig', payload: getKubeConfigContext(envKubeconfigParts[0])});

      dispatch({
        type: 'alert/setAlert',
        payload: {
          title: 'KUBECONFIG warning',
          message: 'Found multiple configs, selected the first one.',
          type: AlertEnum.Warning,
        },
      });
    } else {
      dispatch({type: 'config/setKubeConfig', payload: getKubeConfigContext(process.env.KUBECONFIG)});
    }
    return;
  }
  const storedKubeconfig: string | undefined = electronStore.get('appConfig.kubeconfig');

  if (storedKubeconfig && storedKubeconfig.trim().length > 0) {
    dispatch({type: 'config/setKubeConfig', payload: getKubeConfigContext(storedKubeconfig)});
    return;
  }

  const possibleKubeconfig = path.join(userHomeDir, `${path.sep}.kube${path.sep}config`);
  dispatch({type: 'config/setKubeConfig', payload: getKubeConfigContext(possibleKubeconfig)});
}

export default initKubeconfig;

export const getKubeConfigContext = (configPath: string): KubeConfig => {
  try {
    const kc = new k8s.KubeConfig();
    kc.loadFromFile(configPath);

    return {
      path: configPath,
      currentContext: kc.getCurrentContext(),
      isPathValid: kc.contexts.length > 0,
      contexts: kc.contexts as KubeConfigContext[],
    };
  } catch (error) {
    return {
      path: configPath,
      isPathValid: false,
      contexts: [],
    };
  }
};
