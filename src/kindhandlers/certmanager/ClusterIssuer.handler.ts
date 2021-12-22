import {
  CERT_MANAGER_DEFAULT_RESOURCE_VERSION,
  CERT_MANAGER_RESOURCE_GROUP,
  CERT_MANAGER_SUBSECTION_NAME,
} from '@src/kindhandlers/certmanager/constants';
import {createClusterCustomObjectKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';

const ClusterIssuerHandler = createClusterCustomObjectKindHandler(
  'ClusterIssuer',
  CERT_MANAGER_SUBSECTION_NAME,
  'ClusterIssuers',
  CERT_MANAGER_RESOURCE_GROUP,
  CERT_MANAGER_DEFAULT_RESOURCE_VERSION,
  'clusterissuers',
  'certmanager/clusterissuer.json',
  'https://cert-manager.io/docs/concepts/issuer/',
  [
    {
      source: {
        pathParts: ['spec', 'acme', 'privateKeySecretRef', 'name'],
      },
      type: 'name',
      target: {
        kind: 'Secret',
      },
    },
  ]
);

export default ClusterIssuerHandler;
