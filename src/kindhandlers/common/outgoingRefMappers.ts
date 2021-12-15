import {NamespaceRefTypeEnum, RefMapper} from '@models/resourcekindhandler';

export const ConfigMapTarget = {
  target: {
    kind: 'ConfigMap',
  },
};

export const SecretTarget = {
  target: {
    kind: 'Secret',
  },
};

export const ServiceAccountTarget = {
  target: {
    kind: 'ServiceAccount',
  },
};

export const PersistentVolumeClaimTarget = {
  target: {
    kind: 'PersistentVolumeClaim',
  },
};

export const PodOutgoingRefMappers: RefMapper[] = [
  {
    source: {
      pathParts: ['configMapRef', 'name'],
      hasOptionalSibling: true,
    },
    type: 'name',
    ...ConfigMapTarget,
  },
  {
    source: {
      pathParts: ['configMapKeyRef', 'name'],
      hasOptionalSibling: true,
    },
    type: 'name',
    ...ConfigMapTarget,
  },
  {
    source: {
      pathParts: ['configMap', 'name'],
    },
    type: 'name',
    ...ConfigMapTarget,
  },
  {
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#secretvolumesource-v1-core
    source: {
      pathParts: ['volumes', '*', 'secret', 'secretName'],
      hasOptionalSibling: true,
    },
    type: 'name',
    ...SecretTarget,
  },
  {
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#secretprojection-v1-core
    source: {
      pathParts: ['sources', '*', 'secret', 'name'],
      hasOptionalSibling: true,
    },
    type: 'name',
    ...SecretTarget,
  },
  {
    // secretRefs can be one of https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#objectreference-v1-core (with namespace)
    // or https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#secretreference-v1-core (with namespace)
    // or https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#localobjectreference-v1-core (without namespace)
    source: {
      pathParts: ['secretRef', 'name'],
      namespaceRef: NamespaceRefTypeEnum.OptionalExplicit, // secretRefs can be either
    },
    type: 'name',
    ...SecretTarget,
  },
  {
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#secretreference-v1-core (with namespace)
    source: {
      pathParts: ['controllerExpandSecretRef', 'name'],
      namespaceRef: NamespaceRefTypeEnum.Explicit,
    },
    type: 'name',
    ...SecretTarget,
  },
  {
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#secretreference-v1-core (with namespace)
    source: {
      pathParts: ['controllerPublishSecretRef', 'name'],
      namespaceRef: NamespaceRefTypeEnum.Explicit,
    },
    type: 'name',
    ...SecretTarget,
  },
  {
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#secretreference-v1-core (with namespace)
    source: {
      pathParts: ['nodePublishSecretRef', 'name'],
      namespaceRef: NamespaceRefTypeEnum.Explicit,
    },
    type: 'name',
    ...SecretTarget,
  },
  {
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#secretreference-v1-core (with namespace)
    source: {
      pathParts: ['nodeStageSecretRef', 'name'],
      namespaceRef: NamespaceRefTypeEnum.Explicit,
    },
    type: 'name',
    ...SecretTarget,
  },
  {
    source: {
      pathParts: ['secretKeyRef', 'name'],
      hasOptionalSibling: true,
    },
    type: 'name',
    ...SecretTarget,
  },
  {
    source: {
      pathParts: ['imagePullSecrets', '*', 'name'],
      namespaceRef: NamespaceRefTypeEnum.Implicit,
    },
    type: 'name',
    ...SecretTarget,
  },
  {
    source: {
      pathParts: ['serviceAccountName'],
    },
    type: 'name',
    ...ServiceAccountTarget,
  },
  {
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#persistentvolumeclaimvolumesource-v1-core
    source: {
      pathParts: ['persistentVolumeClaim', 'claimName'],
      namespaceRef: NamespaceRefTypeEnum.Implicit,
    },
    type: 'name',
    ...PersistentVolumeClaimTarget,
  },
];
