import {K8sResource, ResourceRefType} from '@models/k8sresource';

export function isIncomingRef(refType: ResourceRefType) {
  return refType === ResourceRefType.Incoming;
}

export function isOutgoingRef(refType: ResourceRefType) {
  return refType === ResourceRefType.Outgoing;
}

export function isUnsatisfiedRef(refType: ResourceRefType) {
  return refType === ResourceRefType.Unsatisfied;
}

export function hasIncomingRefs(resource: K8sResource) {
  return resource.refs?.some(e => isIncomingRef(e.type));
}

export function hasOutgoingRefs(resource: K8sResource) {
  return resource.refs?.some(e => isOutgoingRef(e.type));
}

export function hasRefs(resource: K8sResource) {
  return resource.refs?.some(e => isOutgoingRef(e.type));
}

export function hasUnsatisfiedRefs(resource: K8sResource) {
  return resource.refs?.some(e => isUnsatisfiedRef(e.type));
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
  matchPairs?: boolean;
};

const ConfigMapTarget = {
  target: {
    kind: 'ConfigMap',
    path: 'metadata.name',
  },
};

const SecretTarget = {
  target: {
    kind: 'Secret',
    path: 'metadata.name',
  },
};

const ServiceAccountTarget = {
  target: {
    kind: 'ServiceAccount',
    path: 'metadata.name',
  },
};

const createCommonRefMappers = (sourceKind: string): RefMapper[] => {
  return [
    {
      source: {
        kind: sourceKind,
        path: 'configMapRef.name',
      },
      ...ConfigMapTarget,
    },
    {
      source: {
        kind: sourceKind,
        path: 'configMapKeyRef.name',
      },
      ...ConfigMapTarget,
    },
    {
      source: {
        kind: sourceKind,
        path: 'volumes.configMap.name',
      },
      ...ConfigMapTarget,
    },
    {
      source: {
        kind: sourceKind,
        path: 'volumes.secret.secretName',
      },
      ...SecretTarget,
    },
    {
      source: {
        kind: sourceKind,
        path: 'secretKeyRef.name',
      },
      ...SecretTarget,
    },
    {
      source: {
        kind: sourceKind,
        path: 'imagePullSecrets',
      },
      ...SecretTarget,
    },
    {
      source: {
        kind: sourceKind,
        path: 'serviceAccountName',
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
      },
      target: {
        kind: 'ClusterRole',
        path: 'metadata.name',
      },
    },
  ],
  DaemonSet: createCommonRefMappers('DaemonSet'),
  Deployment: [
    ...createCommonRefMappers('Deployment'),
    {
      source: {
        kind: 'Deployment',
        path: 'spec.template.metadata.labels',
      },
      target: {
        kind: 'Service',
        path: 'spec.selector',
      },
      matchPairs: true,
    },
  ],
  Endpoint: [
    {
      source: {
        kind: 'Endpoint',
        path: 'metadata.name',
      },
      target: {
        kind: 'Service',
        path: 'metadata.name',
      },
    },
  ],
  Ingress: [
    {
      source: {
        kind: 'Ingress',
        path: 'backend.service.name',
      },
      target: {
        kind: 'Service',
        path: 'metadata.name',
      },
    },
  ],
  Job: createCommonRefMappers('Job'),
  PersistentVolume: [
    {
      source: {
        kind: 'PersistentVolume',
        path: 'spec.claimRef.name',
      },
      target: {kind: 'PersistentVolumeClaim', path: 'metadata.name'},
    },
  ],
  PersistentVolumeClaim: [
    {
      source: {
        kind: 'PersistentVolumeClaim',
        path: 'spec.volumeName',
      },
      target: {
        kind: 'PersistentVolume',
        path: 'metadata.name',
      },
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
      },
      target: {
        kind: 'ClusterRoleBinding',
        path: 'metadata.name',
      },
    },
    {
      source: {
        kind: 'RoleBinding',
        path: 'roleRef.name',
      },
      target: {
        kind: 'Role',
        path: 'metadata.name',
      },
    },
  ],
  Secret: [
    {
      source: {
        kind: 'Secret',
        path: 'metadata.annotations.kubernetes.io/service-account.name',
      },
      target: {kind: 'ServiceAccount', path: 'metadata.name'},
    },
  ],
  ServiceAccount: [
    {
      source: {kind: 'ServiceAccount', path: 'secrets'},
      target: {kind: 'Secret', path: 'metadata.name'},
    },
  ],
  StatefulSet: createCommonRefMappers('StatefulSet'),
};
