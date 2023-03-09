/* eslint-disable no-constructor-return */
import * as k8s from '@kubernetes/client-node';

import {createKubeClient} from '@shared/utils/kubeclient';

export class KubeConfigManager {
  private static instance: KubeConfigManager;
  public kubeConfig?: k8s.KubeConfig;
  private kubeConfigPath?: string;
  private kubeConfigContext?: string;

  constructor() {
    if (KubeConfigManager.instance) {
      return KubeConfigManager.instance;
    }
    KubeConfigManager.instance = this;
  }

  initializeKubeConfig(kubeConfigPath?: string, context?: string) {
    try {
      this.kubeConfigPath = kubeConfigPath;
      this.kubeConfigContext = context;
      const kc = createKubeClient(this.kubeConfigPath as string, this.kubeConfigContext);
      this.kubeConfig = kc;
    } catch (error) {
      this.kubeConfigPath = undefined;
      this.kubeConfigContext = undefined;
      this.kubeConfig = undefined;
    }
  }

  setKubeConfigContext(context: string) {
    this.getKubeConfig().setCurrentContext(context);
  }

  getKubeConfig(): k8s.KubeConfig {
    return this.kubeConfig as k8s.KubeConfig;
  }

  setKubeConfig(kubeConfig: k8s.KubeConfig) {
    this.kubeConfig = kubeConfig;
  }

  getV1ApiClient(): k8s.CoreV1Api | undefined {
    if (this.kubeConfig) {
      return this.kubeConfig.makeApiClient(k8s.CoreV1Api);
    }
    return undefined;
  }

  getStorageApiClient(): k8s.StorageV1Api | undefined {
    if (this.kubeConfig) {
      return this.kubeConfig.makeApiClient(k8s.StorageV1Api);
    }
    return undefined;
  }

  getMetricsClient(): k8s.Metrics | undefined {
    if (this.kubeConfig) {
      return new k8s.Metrics(this.kubeConfig);
    }
    return undefined;
  }
}
