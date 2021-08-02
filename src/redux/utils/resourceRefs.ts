import {K8sResource, ResourceRefType} from '@models/k8sresource';

const incomingRefs = [
  ResourceRefType.KustomizationParent,
  ResourceRefType.ConfigMapRef,
  ResourceRefType.SelectedPodName,
  ResourceRefType.SecretRef,
  ResourceRefType.ServiceAccountRef,
  ResourceRefType.PersistentVolumeRef,
  ResourceRefType.PersistentVolumeClaimRef,
];

const outgoingRefs = [
  ResourceRefType.KustomizationResource,
  ResourceRefType.ConfigMapConsumer,
  ResourceRefType.ServicePodSelector,
  ResourceRefType.SecretConsumer,
  ResourceRefType.ServiceAccountConsumer,
  ResourceRefType.PersistentVolumeConsumer,
  ResourceRefType.PersistentVolumeClaimConsumer,
];

const unsatisfiedRefs = [
  ResourceRefType.UnsatisfiedConfigMap,
  ResourceRefType.UnsatisfiedSelector,
  ResourceRefType.UnsatisfiedSecret,
  ResourceRefType.UnsatisfiedServiceAccount,
  ResourceRefType.UnsatisfiedPersistentVolume,
  ResourceRefType.UnsatisfiedPersistentVolumeClaim,
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
  CronJob: createCommonRefMappers('CronJob'),
  ClusterRoleBinding: [
    {
      source: {
        kind: 'ClusterRoleBinding',
        path: 'roleRef.name',
        refType: ResourceRefType.ClusterRoleConsumer,
      },
      target: {
        kind: 'ClusterRole',
        path: 'metadata.name',
        refType: ResourceRefType.ClusterRoleRef,
      },
      unsatisfiedRefType: ResourceRefType.UnsatisfiedClusterRole,
    },
  ],
  DaemonSet: createCommonRefMappers('DaemonSet'),
  Deployment: createCommonRefMappers('Deployment'),
  Endpoint: [
    {
      source: {
        kind: 'Endpoint',
        path: 'metadata.name',
        refType: ResourceRefType.ServiceConsumer,
      },
      target: {
        kind: 'Service',
        path: 'metadata.name',
        refType: ResourceRefType.ServiceRef,
      },
      unsatisfiedRefType: ResourceRefType.UnsatisfiedService,
    },
  ],
  Ingress: [
    {
      source: {
        kind: 'Ingress',
        path: 'backend.service.name',
        refType: ResourceRefType.ServiceConsumer,
      },
      target: {
        kind: 'Service',
        path: 'metadata.name',
        refType: ResourceRefType.ServiceRef,
      },
      unsatisfiedRefType: ResourceRefType.UnsatisfiedService,
    },
  ],
  Job: createCommonRefMappers('Job'),
  PersistentVolume: [
    {
      source: {
        kind: 'PersistentVolume',
        path: 'spec.claimRef.name',
        refType: ResourceRefType.PersistentVolumeClaimConsumer,
      },
      target: {kind: 'PersistentVolumeClaim', path: 'metadata.name', refType: ResourceRefType.PersistentVolumeClaimRef},
      unsatisfiedRefType: ResourceRefType.UnsatisfiedPersistentVolumeClaim,
    },
  ],
  PersistentVolumeClaim: [
    {
      source: {
        kind: 'PersistentVolumeClaim',
        path: 'spec.volumeName',
        refType: ResourceRefType.PersistentVolumeConsumer,
      },
      target: {
        kind: 'PersistentVolume',
        path: 'metadata.name',
        refType: ResourceRefType.PersistentVolumeRef,
      },
      unsatisfiedRefType: ResourceRefType.UnsatisfiedPersistentVolume,
    },
  ],
  Pod: createCommonRefMappers('Pod'),
  ReplicationController: createCommonRefMappers('ReplicationController'),
  ReplicaSet: createCommonRefMappers('ReplicaSet'),
  RoleBinding: [
    {
      source: {
        kind: 'RoleBinding',
        path: 'roleRef.name',
        refType: ResourceRefType.ClusterRoleBindingConsumer,
      },
      target: {
        kind: 'ClusterRoleBinding',
        path: 'metadata.name',
        refType: ResourceRefType.ClusterRoleBindingRef,
      },
      unsatisfiedRefType: ResourceRefType.UnsatisfiedClusterRoleBinding,
    },
    {
      source: {
        kind: 'RoleBinding',
        path: 'roleRef.name',
        refType: ResourceRefType.RoleConsumer,
      },
      target: {
        kind: 'Role',
        path: 'metadata.name',
        refType: ResourceRefType.RoleRef,
      },
      unsatisfiedRefType: ResourceRefType.UnsatisfiedRole,
    },
  ],
  Secret: [
    {
      source: {
        kind: 'Secret',
        path: 'metadata.annotations.kubernetes.io/service-account.name',
        refType: ResourceRefType.ServiceAccountConsumer,
      },
      target: {kind: 'ServiceAccount', path: 'metadata.name', refType: ResourceRefType.ServiceAccountRef},
      unsatisfiedRefType: ResourceRefType.UnsatisfiedServiceAccount,
    },
  ],
  ServiceAccount: [
    {
      source: {kind: 'ServiceAccount', path: 'secrets', refType: ResourceRefType.SecretConsumer},
      target: {kind: 'Secret', path: 'metadata.name', refType: ResourceRefType.SecretRef},
      unsatisfiedRefType: ResourceRefType.UnsatisfiedSecret,
    },
  ],
  StatefulSet: createCommonRefMappers('StatefulSet'),
};
