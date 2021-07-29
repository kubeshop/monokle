import {K8sResource, ResourceRefType} from '@models/k8sresource';

const incomingRefs = [
  ResourceRefType.KustomizationParent,
  ResourceRefType.ConfigMapRef,
  ResourceRefType.SelectedPodName,
];

const outgoingRefs = [
  ResourceRefType.KustomizationResource,
  ResourceRefType.ConfigMapConsumer,
  ResourceRefType.ServicePodSelector,
];

const unsatisfiedRefs = [ResourceRefType.UnsatisfiedConfigMap, ResourceRefType.UnsatisfiedSelector];

export function isIncomingRef(e: ResourceRefType) {
  return incomingRefs.includes(e);
}

export function isOutgoingRef(e: ResourceRefType) {
  return outgoingRefs.includes(e);
}

export function isUnsatisfiedRef(e: ResourceRefType) {
  return unsatisfiedRefs.includes(e);
}

export function hasIncomingRefs(resource: K8sResource) {
  return resource.refs?.some(e => isIncomingRef(e.refType));
}

export function hasOutgoingRefs(resource: K8sResource) {
  return resource.refs?.some(e => isOutgoingRef(e.refType));
}

export function hasRefs(resource: K8sResource) {
  return resource.refs?.some(e => isOutgoingRef(e.refType));
}

export function hasUnsatisfiedRefs(resource: K8sResource) {
  return resource.refs?.some(e => isUnsatisfiedRef(e.refType));
}

export type RefMapper = {
  source: {
    kind: string;
    path: string;
  };
  target: {
    kind: string;
    path: string;
  };
};

const createCommonRefMappers = (sourceKind: string): RefMapper[] => {
  return [
    {
      source: {
        kind: sourceKind,
        path: 'configMapRef.name',
      },
      target: {
        kind: 'ConfigMap',
        path: 'metadata.name',
      },
    },
    {
      source: {
        kind: sourceKind,
        path: 'configMapKeyRef.name',
      },
      target: {
        kind: 'ConfigMap',
        path: 'metadata.name',
      },
    },
    {
      source: {
        kind: sourceKind,
        path: 'volumes.configMap.name',
      },
      target: {
        kind: 'ConfigMap',
        path: 'metadata.name',
      },
    },
    {
      source: {
        kind: sourceKind,
        path: 'volumes.secret.secretName',
      },
      target: {
        kind: 'Secret',
        path: 'metadata.name',
      },
    },
    {
      source: {
        kind: sourceKind,
        path: 'secretKeyRef.name',
      },
      target: {
        kind: 'Secret',
        path: 'metadata.name',
      },
    },
    {
      source: {
        kind: sourceKind,
        path: 'imagePullSecrets',
      },
      target: {
        kind: 'Secret',
        path: 'metadata.name',
      },
    },
    {
      source: {
        kind: sourceKind,
        path: 'serviceAccountName',
      },
      target: {
        kind: 'ServiceAccount',
        path: 'metadata.name',
      },
    },
  ];
};

export const RefMappersByResourceKind: Record<string, RefMapper[]> = {
  Service: [
    {
      source: {kind: 'Service', path: 'content.spec.selector'},
      target: {kind: 'Deployment', path: 'spec.template.metadata.labels'},
    },
  ],
  Deployment: createCommonRefMappers('Deployment'),
  Pod: createCommonRefMappers('Pod'),
  DaemonSet: createCommonRefMappers('DaemonSet'),
  Job: createCommonRefMappers('Job'),
  StatefulSet: createCommonRefMappers('StatefulSet'),
  ReplicaSet: createCommonRefMappers('ReplicaSet'),
  CronJob: createCommonRefMappers('CronJob'),
  ReplicationController: createCommonRefMappers('ReplicationController'),
  ServiceAccount: [
    {
      source: {kind: 'ServiceAccount', path: 'secrets'},
      target: {kind: 'Secret', path: 'metadata.name'},
    },
  ],
};
