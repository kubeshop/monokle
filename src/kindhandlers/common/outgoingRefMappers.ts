import {OutgoingRefMapper} from '@models/resourcekindhandler';

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

export const PodOutgoingRefMappers: OutgoingRefMapper[] = [
  {
    source: {
      pathParts: ['configMapRef', 'name'],
    },
    ...ConfigMapTarget,
  },
  {
    source: {
      pathParts: ['configMapKeyRef', 'name'],
    },
    ...ConfigMapTarget,
  },
  {
    source: {
      pathParts: ['volumes', 'configMap', 'name'],
    },
    ...ConfigMapTarget,
  },
  {
    source: {
      pathParts: ['volumes', 'secret', 'secretName'],
    },
    ...SecretTarget,
  },
  {
    source: {
      pathParts: ['secretKeyRef', 'name'],
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
