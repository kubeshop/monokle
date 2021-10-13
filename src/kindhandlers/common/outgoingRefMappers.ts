import {RefMapper} from '@models/resourcekindhandler';

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
    source: {
      pathParts: ['volumes', 'secret', 'secretName'],
      hasOptionalSibling: true,
    },
    ...SecretTarget,
  },
  {
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#secretprojection-v1-core
    source: {
      pathParts: ['sources', 'secret', 'name'],
      hasOptionalSibling: true,
    },
    ...SecretTarget,
  },
  {
    source: {
      pathParts: ['secretRef', 'name'],
    },
    ...SecretTarget,
  },
  {
    source: {
      pathParts: ['controllerExpandSecretRef', 'name'],
    },
    ...SecretTarget,
  },
  {
    source: {
      pathParts: ['controllerPublishSecretRef', 'name'],
    },
    ...SecretTarget,
  },
  {
    source: {
      pathParts: ['nodePublishSecretRef', 'name'],
    },
    ...SecretTarget,
  },
  {
    source: {
      pathParts: ['nodeStageSecretRef', 'name'],
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
      pathParts: ['imagePullSecrets'],
    },
    ...SecretTarget,
  },
  {
    source: {
      pathParts: ['serviceAccountName'],
    },
    ...ServiceAccountTarget,
  },
];
