import {getClusterProxyPort, getKubeConfigPath, getKubeContext} from '@redux/cluster/getters';

export function getHelmClusterArgs(): string[] {
  const kubeconfigPath = getKubeConfigPath();
  const context = getKubeContext();
  const proxyPort = getClusterProxyPort();

  if (!kubeconfigPath || !context || !proxyPort) return [];

  return [
    '--kubeconfig',
    kubeconfigPath,
    '--kube-context',
    context,
    '--kube-apiserver',
    `http://127.0.0.1:${proxyPort}`,
  ];
}
