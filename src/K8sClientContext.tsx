import * as k8s from '@kubernetes/client-node';

import {FC, createContext, useContext} from 'react';

import {currentKubeContextSelector, kubeConfigPathSelector} from '@redux/appConfig';
import {useAppSelector} from '@redux/hooks';

import {createKubeClient} from '@shared/utils/kubeclient';

export const k8sClientContext = createContext<any>(null);

export const K8sClientProvider: FC<any> = ({children}) => {
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const clusterProxyPort = useAppSelector(state => state.config.clusterProxyPort);
  const currentContext = useAppSelector(currentKubeContextSelector);
  const k8sClient = new KubeConfigManager();
  k8sClient.initializeKubeConfig(kubeConfigPath, currentContext, clusterProxyPort);
  const context = {
    setKubeConfigContext: k8sClient.setKubeConfigContext,
    getKubeConfig: k8sClient.getKubeConfig,
    setKubeConfig: k8sClient.setKubeConfig,
    getV1ApiClient: k8sClient.getV1ApiClient,
    getStorageApiClient: k8sClient.getStorageApiClient,
    getMetricsClient: k8sClient.getMetricsClient,
  };
  return <k8sClientContext.Provider value={context}>{children}</k8sClientContext.Provider>;
};

export const useK8sClient = () => {
  const k8sClient = useContext(k8sClientContext);
  if (!k8sClient) {
    throw new Error('K8sClientContext must be used within a K8sClientProvider');
  }
  return k8sClient;
};

export class KubeConfigManager {
  public kubeConfig?: k8s.KubeConfig;
  private kubeConfigPath?: string;
  private kubeConfigContext?: string;

  public initializeKubeConfig(kubeConfigPath?: string, context?: string, proxy?: number) {
    try {
      this.kubeConfigPath = kubeConfigPath;
      this.kubeConfigContext = context;
      let kc = createKubeClient(this.kubeConfigPath as string, this.kubeConfigContext, proxy);

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
