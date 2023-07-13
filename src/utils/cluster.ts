import store from '@redux/store';

export function getKubeContext(): string | undefined {
  return store.getState().main.clusterConnection?.context;
}

export function getClusterNamespace(): string | undefined {
  return store.getState().main.clusterConnection?.namespace;
}

export function getClusterProxyPort(): number | undefined {
  return store.getState().cluster.proxyPort;
}

export function getHelmClusterArgs(): string[] {
  const context = getKubeContext();
  const proxyPort = getClusterProxyPort();

  if (!context || !proxyPort) return [];

  return ['--kube-context', context, '--kube-api-server', `http://127.0.0.1:${proxyPort}`];
}
