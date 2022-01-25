import * as k8s from '@kubernetes/client-node';

import path from 'path';
import {AnyAction} from 'redux';

import {AlertEnum} from '@models/alert';
import {KubeConfig, KubeConfigContext} from '@models/appconfig';

import {setAlert} from '@redux/reducers/alert';
import {setKubeConfig} from '@redux/reducers/appConfig';
import {onUserPerformedClickOnClusterIcon} from '@redux/reducers/uiCoach';
import {monitorKubeConfig} from '@redux/services/kubeConfigMonitor';

import electronStore from '@utils/electronStore';
import {PROCESS_ENV} from '@utils/env';

function initKubeconfig(dispatch: (action: AnyAction) => void, userHomeDir: string) {
  if (PROCESS_ENV.KUBECONFIG) {
    const envKubeconfigParts = PROCESS_ENV.KUBECONFIG.split(path.delimiter);
    if (envKubeconfigParts.length > 1) {
      dispatch(setKubeConfig(getKubeConfigContext(envKubeconfigParts[0])));
      monitorKubeConfig(envKubeconfigParts[0], dispatch);

      dispatch(
        setAlert({
          title: 'KUBECONFIG warning',
          message: 'Found multiple configs, selected the first one.',
          type: AlertEnum.Warning,
        })
      );
    } else {
      dispatch(setKubeConfig(getKubeConfigContext(PROCESS_ENV.KUBECONFIG)));
      monitorKubeConfig(PROCESS_ENV.KUBECONFIG, dispatch);
    }
    return;
  }
  const storedKubeconfig: string | undefined = electronStore.get('appConfig.kubeconfig');
  const hasUserPerformedClickOnClusterIcon: boolean = electronStore.get('appConfig.hasUserPerformedClickOnClusterIcon');

  if (hasUserPerformedClickOnClusterIcon) {
    dispatch(onUserPerformedClickOnClusterIcon());
  }

  if (storedKubeconfig && storedKubeconfig.trim().length > 0) {
    dispatch(setKubeConfig(getKubeConfigContext(storedKubeconfig)));
    monitorKubeConfig(storedKubeconfig, dispatch);
    return;
  }

  const possibleKubeconfig = path.join(userHomeDir, `${path.sep}.kube${path.sep}config`);
  dispatch(setKubeConfig(getKubeConfigContext(possibleKubeconfig)));
  monitorKubeConfig(possibleKubeconfig, dispatch);
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
    };
  }
};
