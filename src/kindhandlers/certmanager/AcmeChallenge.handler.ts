import {
  CERT_MANAGER_ACME_RESOURCE_GROUP,
  CERT_MANAGER_DEFAULT_RESOURCE_VERSION,
  CERT_MANAGER_SUBSECTION_NAME,
} from '@src/kindhandlers/certmanager/constants';
import {createNamespacedCustomObjectKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';

const AcmeChallengeHandler = createNamespacedCustomObjectKindHandler(
  'Challenge',
  CERT_MANAGER_SUBSECTION_NAME,
  'Challenges',
  CERT_MANAGER_ACME_RESOURCE_GROUP,
  CERT_MANAGER_DEFAULT_RESOURCE_VERSION,
  'challenges',
  'certmanager/acmechallenge.json',
  'https://cert-manager.io/docs/concepts/acme-orders-challenges/',
  [
    {
      source: {
        pathParts: ['spec', 'issuerRef', 'name'],
      },
      type: 'name',
      target: {
        kind: 'ClusterIssuer',
      },
    },
  ]
);

export default AcmeChallengeHandler;
