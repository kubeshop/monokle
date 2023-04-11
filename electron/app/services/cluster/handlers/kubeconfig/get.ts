import * as k8s from '@kubernetes/client-node';

import {ModernKubeConfig} from '@shared/models/config';

import {getDefaultKubeConfig} from '../../utils/getDefaultKubeConfig';

type KubeConfigGet = {
  path: string | undefined;
};

export async function getKubeConfig(options: KubeConfigGet): Promise<ModernKubeConfig> {
  const path = options.path ?? getDefaultKubeConfig();
  const config = new k8s.KubeConfig();
  config.loadFromFile(path);

  return {
    path,
    currentContext: config.getCurrentContext(),
    contexts: config.getContexts(),
    clusters: config.getClusters(),
    users: config.getUsers(),
  };
}
