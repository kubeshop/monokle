import * as k8s from '@kubernetes/client-node';

import path from 'path';
import {AnyAction} from 'redux';

import {AlertEnum} from '@models/alert';
import {KubeConfig, KubeConfigContext} from '@models/appconfig';

import {setAlert} from '@redux/reducers/alert';
import {setKubeConfig} from '@redux/reducers/appConfig';

import electronStore from '@shared/electronStore';

function initKubeconfig(dispatch: (action: AnyAction) => void, userHomeDir: string) {
  if (process.env.KUBECONFIG) {
    const envKubeconfigParts = process.env.KUBECONFIG.split(path.delimiter);
    if (envKubeconfigParts.length > 1) {
      dispatch(setKubeConfig(getKubeConfigContext(envKubeconfigParts[0])));

      dispatch(
        setAlert({
          title: 'KUBECONFIG warning',
          message: 'Found multiple configs, selected the first one.',
          type: AlertEnum.Warning,
        })
      );
    } else {
      dispatch(setKubeConfig(getKubeConfigContext(process.env.KUBECONFIG)));
    }
    return;
  }
  const storedKubeconfig: string | undefined = electronStore.get('appConfig.kubeconfig');

  if (storedKubeconfig && storedKubeconfig.trim().length > 0) {
    dispatch(setKubeConfig(getKubeConfigContext(storedKubeconfig)));
    return;
  }

  const possibleKubeconfig = path.join(userHomeDir, `${path.sep}.kube${path.sep}config`);
  dispatch(setKubeConfig(getKubeConfigContext(possibleKubeconfig)));
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
