import type {MonokleClusterError} from '@shared/ipc';

import type {ModernKubeConfig} from './config';

export type ClusterState = {
  watching: boolean;

  /**
   * The error of the proxy for the current context of the kubeconfig file, if any.
   */
  proxyError: MonokleClusterError | undefined;

  /**
   * The port of the proxy for the current context of the kubeconfig file, if any.
   */
  proxyPort: number | undefined;

  configPaths: string[];
  kubeconfigs: Record<string, ModernKubeConfig>;
};
