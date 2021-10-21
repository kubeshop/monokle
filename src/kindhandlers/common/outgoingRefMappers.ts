import {NamespaceRefEnum, RefMapper} from '@models/resourcekindhandler';

const ConfigMapTarget = {
  target: {
    kind: 'ConfigMap',
    pathParts: ['metadata', 'name'],
  },
};

const SecretTarget = {
  target: {
    kind: 'Secret',
    pathParts: ['metadata', 'name'],
  },
};

const ServiceAccountTarget = {
  target: {
    kind: 'ServiceAccount',
    pathParts: ['metadata', 'name'],
  },
};

const PersistentVolumeClaimTarget = {
  target: {
    kind: 'PersistentVolumeClaim',
    pathParts: ['metadata', 'name'],
  },
};

export const PodOutgoingRefMappers: RefMapper[] = [
  {
    source: {
      pathParts: ['configMapRef', 'name'],
      hasOptionalSibling: true,
    },
    ...ConfigMapTarget,
  },
  {
    source: {
      pathParts: ['configMapKeyRef', 'name'],
      hasOptionalSibling: true,
    },
    ...ConfigMapTarget,
  },
  {
    source: {
      pathParts: ['configMap', 'name'],
    },
    ...ConfigMapTarget,
  },
  {
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#secretvolumesource-v1-core
    source: {
      pathParts: ['volumes', '*', 'secret', 'secretName'],
      hasOptionalSibling: true,
    },
    ...SecretTarget,
  },
  {
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#azurefilepersistentvolumesource-v1-core
    source: {
      pathParts: ['spec', 'azureFile', 'secretName'],
      namespaceRef: NamespaceRefEnum.Explicit,
      namespaceProperty: 'secretNamespace',
    },
    ...SecretTarget,
  },
  {
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#azurefilepersistentvolumesource-v1-core
    source: {
      pathParts: ['inlineVolumeSpec', 'azureFile', 'secretName'],
      namespaceRef: NamespaceRefEnum.Explicit,
      namespaceProperty: 'secretNamespace',
    },
    ...SecretTarget,
  },
  {
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#azurefilevolumesource-v1-core
    source: {
      pathParts: ['volumes', '*', 'azureFile', 'secretName'],
    },
    ...SecretTarget,
  },
  {
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#secretprojection-v1-core
    source: {
      pathParts: ['sources', '*', 'secret', 'name'],
      hasOptionalSibling: true,
    },
    ...SecretTarget,
  },
  {
    // secretRefs can be one of https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#objectreference-v1-core (with namespace)
    // or https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#secretreference-v1-core (with namespace)
    // or https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#localobjectreference-v1-core (without namespace)
    source: {
      pathParts: ['secretRef', 'name'],
      namespaceRef: NamespaceRefEnum.OptionalImplicit, // secretRefs can be either
    },
    ...SecretTarget,
  },
  {
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#secretreference-v1-core (with namespace)
    source: {
      pathParts: ['controllerExpandSecretRef', 'name'],
      namespaceRef: NamespaceRefEnum.Explicit,
    },
    ...SecretTarget,
  },
  {
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#secretreference-v1-core (with namespace)
    source: {
      pathParts: ['controllerPublishSecretRef', 'name'],
      namespaceRef: NamespaceRefEnum.Explicit,
    },
    ...SecretTarget,
  },
  {
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#secretreference-v1-core (with namespace)
    source: {
      pathParts: ['nodePublishSecretRef', 'name'],
      namespaceRef: NamespaceRefEnum.Explicit,
    },
    ...SecretTarget,
  },
  {
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#secretreference-v1-core (with namespace)
    source: {
      pathParts: ['nodeStageSecretRef', 'name'],
      namespaceRef: NamespaceRefEnum.Explicit,
    },
    ...SecretTarget,
  },
  {
    source: {
      pathParts: ['secretKeyRef', 'name'],
      hasOptionalSibling: true,
    },
    ...SecretTarget,
  },
  {
    source: {
      pathParts: ['imagePullSecrets', '*', 'name'],
      namespaceRef: NamespaceRefEnum.Implicit,
    },
    ...SecretTarget,
  },
  {
    source: {
      pathParts: ['serviceAccountName'],
    },
    ...ServiceAccountTarget,
  },
  {
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#persistentvolumeclaimvolumesource-v1-core
    source: {
      pathParts: ['persistentVolumeClaim', 'claimName'],
      namespaceRef: NamespaceRefEnum.Implicit,
    },
    ...PersistentVolumeClaimTarget,
  },
];
