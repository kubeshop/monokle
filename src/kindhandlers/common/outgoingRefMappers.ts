import {OutgoingRefMapper} from '@models/resourcekindhandler';

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

export const PodOutgoingRefMappers: OutgoingRefMapper[] = [
  {
    source: {
      path: 'configMapRef.name',
    },
    ...ConfigMapTarget,
  },
  {
    source: {
      path: 'configMapKeyRef.name',
    },
    ...ConfigMapTarget,
  },
  {
    source: {
      path: 'volumes.configMap.name',
    },
    ...ConfigMapTarget,
  },
  {
    source: {
      path: 'volumes.secret.secretName',
    },
    ...SecretTarget,
  },
  {
    source: {
      path: 'secretKeyRef.name',
    },
    ...SecretTarget,
  },
  {
    source: {
      path: 'imagePullSecrets',
    },
    ...SecretTarget,
  },
  {
    source: {
      path: 'serviceAccountName',
    },
    ...ServiceAccountTarget,
  },
];
