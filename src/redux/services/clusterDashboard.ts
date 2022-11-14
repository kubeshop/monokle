import * as k8s from '@kubernetes/client-node';

import _ from 'lodash';

export const getClusterEvents = async (k8sApiClient: k8s.CoreV1Api, namespace?: string): Promise<ClusterEvent[]> => {
  const events: k8s.CoreV1Event[] | undefined = namespace
    ? (await k8sApiClient?.listNamespacedEvent(namespace))?.body.items
    : (await k8sApiClient?.listEventForAllNamespaces())?.body.items;

  if (!events) {
    return [];
  }

  return _.sortBy(
    events.map((event: k8s.CoreV1Event) => ({
      type: event.type || 'Unspecified',
      message: event.message || '',
      reason: event.reason || '',
      source: {
        host: event.source?.host || '',
        component: event.source?.component || '',
      },
      metadata: {
        name: event.metadata?.name || '',
        namespace: event.metadata?.namespace || '',
        uid: event.metadata?.uid || '',
        creationTimestamp: event.metadata?.creationTimestamp || new Date(0),
      },
      lastTimestamp: event.lastTimestamp || new Date(0),
      involvedObject: event.involvedObject,
      count: event.count || NaN,
    })),
    'lastTimestamp'
  )
    .filter(i => Boolean(i.count))
    .reverse();
};

export const getClusterInformation = async (
  k8sApiClient: k8s.CoreV1Api,
  storageApiClient: k8s.StorageV1Api,
  namespace?: string
): Promise<ClusterInformation> => {
  const responses = await Promise.all([
    k8sApiClient.listNode(),
    namespace ? k8sApiClient.listNamespacedPod(namespace) : k8sApiClient.listPodForAllNamespaces(),
    storageApiClient.listStorageClass(),
    namespace
      ? k8sApiClient.listNamespacedPersistentVolumeClaim(namespace)
      : k8sApiClient.listPersistentVolumeClaimForAllNamespaces(),
  ]);

  const nodes: k8s.V1Node[] = responses[0].body.items;
  const pods: k8s.V1Pod[] = responses[1].body.items;
  const storageClasses: k8s.V1StorageClass[] = responses[2].body.items;
  const persistentVolumeClaims: k8s.V1PersistentVolumeClaim[] = responses[3].body.items;

  console.log(responses.map(response => response.body.items));

  return {
    clusterApiAddress: k8sApiClient.basePath,
    nodesCount: nodes.length,
    podsCapacity: nodes.reduce((total, node) => total + Number(node.status?.capacity?.pods), 0),
    podsCount: pods.length,
    storageClassCount: storageClasses.length,
    persistentVolumeClaimCount: persistentVolumeClaims.length,
  };
};

export interface ClusterEvent {
  type: string;
  message: string;
  reason: string;
  source: {component: string; host: string};
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: Date;
  };
  lastTimestamp: Date;
  involvedObject: k8s.V1ObjectReference;
  count: number;
}

export interface ClusterInformation {
  clusterApiAddress: string;
  nodesCount: number;
  podsCount: number;
  podsCapacity: number;
  storageClassCount: number;
  persistentVolumeClaimCount: number;
}
