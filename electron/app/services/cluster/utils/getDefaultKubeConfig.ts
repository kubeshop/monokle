import {app} from 'electron';

import path from 'path';

export function getDefaultKubeConfig() {
  // TODO: use KUBECONFIG env as override to this default.

  const home = app.getPath('home');
  const kubeConfigPath = path.join(home, `${path.sep}.kube${path.sep}config`);
  return kubeConfigPath;
}
