import * as k8s from '@kubernetes/client-node';

import _ from 'lodash';

export const getClusterEvents = async (k8sApiClient: k8s.CoreV1Api, namespace?: string): Promise<ClusterEvent[]> => {
  const events: k8s.CoreV1Event[] | undefined = namespace
    ? (await k8sApiClient?.listNamespacedEvent(namespace))?.body.items
    : (await k8sApiClient?.listEventForAllNamespaces())?.body.items;

  console.log('events', events);

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
  ).reverse();
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
