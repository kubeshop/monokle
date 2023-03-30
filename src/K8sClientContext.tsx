import * as k8s from '@kubernetes/client-node';

import {FC, createContext, useContext, useMemo} from 'react';

import {isEmpty} from 'lodash';

import {kubeConfigContextSelector, kubeConfigPathSelector} from '@redux/appConfig';
import {useAppSelector} from '@redux/hooks';

import {createKubeClient} from '@shared/utils/kubeclient';

export const k8sClientContext = createContext<any>(null);

let globalK8sClient: k8s.KubeConfig | null;

export const getGlobalK8sClient = (): k8s.KubeConfig => {
  if (!globalK8sClient) {
    throw new Error('getGlobalK8sClient has not been initialized');
  }
  return globalK8sClient;
};

export const K8sClientProvider: FC<any> = ({children}) => {
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const clusterProxyPort = useAppSelector(state => state.config.clusterProxyPort);
  const currentContext = useAppSelector(kubeConfigContextSelector);

  const context = useMemo(() => {
    const k8sClient = new KubeConfigManager();

    if (!isEmpty(kubeConfigPath) && !isEmpty(currentContext) && !isEmpty(clusterProxyPort)) {
      globalK8sClient = createKubeClient(kubeConfigPath as string, currentContext, clusterProxyPort);
      k8sClient.initializeKubeConfig(kubeConfigPath, currentContext, clusterProxyPort);
    }
    return {
      k8sClient: globalK8sClient,
      getV1ApiClient: k8sClient.getV1ApiClient,
      getStorageApiClient: k8sClient.getStorageApiClient,
      getMetricsClient: k8sClient.getMetricsClient,
    };
  }, [kubeConfigPath, currentContext, clusterProxyPort]);

  return <k8sClientContext.Provider value={context}>{children}</k8sClientContext.Provider>;
};

type K8sClientContextType = {
  k8sClient: k8s.KubeConfig;
  getV1ApiClient: () => k8s.CoreV1Api;
  getStorageApiClient: () => k8s.StorageV1Api;
  getMetricsClient: () => k8s.Metrics;
};

export const useK8sClient = () => {
  const k8sClient = useContext<K8sClientContextType>(k8sClientContext);
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
