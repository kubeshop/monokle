// The getters from this file are only used to build the cluster args for helm commands.
// Due to circular dependencies, we can't import the store into the utils/helm file to get the context and proxy port.
// Thus, we rely on the clusterArgsChanged listener to update these getters when the cluster args change.

let kubeconfigPath: string | undefined;
let context: string | undefined;
let proxyPort: number | undefined;

export function getKubeConfigPath(): string | undefined {
  return kubeconfigPath;
}

export function setKubeConfigPath(newKubeconfigPath: string | undefined) {
  kubeconfigPath = newKubeconfigPath;
}

export function getKubeContext(): string | undefined {
  return context;
}

export function setKubeContext(newContext: string | undefined) {
  context = newContext;
}

export function getClusterProxyPort(): number | undefined {
  return proxyPort;
}

export function setClusterProxyPort(newProxyPort: number | undefined) {
  proxyPort = newProxyPort;
}
