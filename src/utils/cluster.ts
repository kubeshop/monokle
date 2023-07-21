import {getClusterProxyPort, getKubeContext} from '@redux/cluster/getters';

export function getHelmClusterArgs(): string[] {
  const context = getKubeContext();
  const proxyPort = getClusterProxyPort();

  if (!context || !proxyPort) return [];

  return ['--kube-context', context, '--kube-apiserver', `http://127.0.0.1:${proxyPort}`];
}
