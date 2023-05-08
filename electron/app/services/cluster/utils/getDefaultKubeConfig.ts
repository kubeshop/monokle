import {app} from 'electron';

import path from 'path';

import {getMainProcessEnv} from '@shared/utils';

export function getDefaultKubeConfig() {
  const mainProcessEnv = getMainProcessEnv() ?? {};

  if (mainProcessEnv.KUBECONFIG) {
    return mainProcessEnv.KUBECONFIG;
  }

  const home = app.getPath('home');
  const kubeConfigPath = path.join(home, `${path.sep}.kube${path.sep}config`);
  return kubeConfigPath;
}
