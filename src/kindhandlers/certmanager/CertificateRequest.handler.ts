import {loadCustomSchema} from '@redux/services/schema';

import {
  CERT_MANAGER_DEFAULT_RESOURCE_VERSION,
  CERT_MANAGER_RESOURCE_GROUP,
  CERT_MANAGER_SUBSECTION_NAME,
} from '@src/kindhandlers/certmanager/constants';
import {createNamespacedCustomObjectKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';

const CertificateRequestHandler = createNamespacedCustomObjectKindHandler(
  'CertificateRequest',
  CERT_MANAGER_SUBSECTION_NAME,
  'CertificateRequests',
  CERT_MANAGER_RESOURCE_GROUP,
  CERT_MANAGER_DEFAULT_RESOURCE_VERSION,
  'certificaterequests',
  loadCustomSchema('certmanager/certificaterequest.json', 'CertificateRequest'),
  'https://cert-manager.io/docs/concepts/certificaterequest/',
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

export default CertificateRequestHandler;
