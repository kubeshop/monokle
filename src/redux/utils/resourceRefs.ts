import {K8sResource, ResourceRefType} from '@models/k8sresource';

const incomingRefs = [
  ResourceRefType.KustomizationParent,
  ResourceRefType.ConfigMapRef,
  ResourceRefType.SelectedPodName,
  ResourceRefType.SecretRef,
  ResourceRefType.ServiceAccountRef,
];

const outgoingRefs = [
  ResourceRefType.KustomizationResource,
  ResourceRefType.ConfigMapConsumer,
  ResourceRefType.ServicePodSelector,
  ResourceRefType.SecretConsumer,
  ResourceRefType.ServiceAccountConsumer,
];

const unsatisfiedRefs = [
  ResourceRefType.UnsatisfiedConfigMap,
  ResourceRefType.UnsatisfiedSelector,
  ResourceRefType.UnsatisfiedSecret,
  ResourceRefType.UnsatisfiedServiceAccount,
];

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
    refType: ResourceRefType;
  };
  target: {
    kind: string;
    path: string;
    refType: ResourceRefType;
  };
  unsatisfiedRefType: ResourceRefType;
};

const ConfigMapTarget = {
  target: {
    kind: 'ConfigMap',
    path: 'metadata.name',
    refType: ResourceRefType.ConfigMapRef,
  },
  unsatisfiedRefType: ResourceRefType.UnsatisfiedConfigMap,
};

const SecretTarget = {
  target: {
    kind: 'Secret',
    path: 'metadata.name',
    refType: ResourceRefType.ConfigMapRef,
  },
  unsatisfiedRefType: ResourceRefType.UnsatisfiedSecret,
};

const ServiceAccountTarget = {
  target: {
    kind: 'ServiceAccount',
    path: 'metadata.name',
    refType: ResourceRefType.ServiceAccountRef,
  },
  unsatisfiedRefType: ResourceRefType.UnsatisfiedServiceAccount,
};

const createCommonRefMappers = (sourceKind: string): RefMapper[] => {
  return [
    {
      source: {
        kind: sourceKind,
        path: 'configMapRef.name',
        refType: ResourceRefType.ConfigMapConsumer,
      },
      ...ConfigMapTarget,
    },
    {
      source: {
        kind: sourceKind,
        path: 'configMapKeyRef.name',
        refType: ResourceRefType.ConfigMapConsumer,
      },
      ...ConfigMapTarget,
    },
    {
      source: {
        kind: sourceKind,
        path: 'volumes.configMap.name',
        refType: ResourceRefType.ConfigMapConsumer,
      },
      ...ConfigMapTarget,
    },
    {
      source: {
        kind: sourceKind,
        path: 'volumes.secret.secretName',
        refType: ResourceRefType.SecretConsumer,
      },
      ...SecretTarget,
    },
    {
      source: {
        kind: sourceKind,
        path: 'secretKeyRef.name',
        refType: ResourceRefType.SecretConsumer,
      },
      ...SecretTarget,
    },
    {
      source: {
        kind: sourceKind,
        path: 'imagePullSecrets',
        refType: ResourceRefType.SecretConsumer,
      },
      ...SecretTarget,
    },
    {
      source: {
        kind: sourceKind,
        path: 'serviceAccountName',
        refType: ResourceRefType.ServiceAccountConsumer,
      },
      ...ServiceAccountTarget,
    },
  ];
};

export const RefMappersByResourceKind: Record<string, RefMapper[]> = {
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
      source: {kind: 'ServiceAccount', path: 'secrets', refType: ResourceRefType.SecretConsumer},
      target: {kind: 'Secret', path: 'metadata.name', refType: ResourceRefType.SecretRef},
      unsatisfiedRefType: ResourceRefType.UnsatisfiedSecret,
    },
  ],
};
