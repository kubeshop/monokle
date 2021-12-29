import {NamespaceRefTypeEnum} from '@models/resourcekindhandler';

import {loadCustomSchema} from '@redux/services/schema';

import {
  CERT_MANAGER_DEFAULT_RESOURCE_VERSION,
  CERT_MANAGER_RESOURCE_GROUP,
  CERT_MANAGER_SUBSECTION_NAME,
} from '@src/kindhandlers/certmanager/constants';
import {createNamespacedCustomObjectKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';
import {implicitNamespaceMatcher} from '@src/kindhandlers/common/outgoingRefMappers';

const CertificateHandler = createNamespacedCustomObjectKindHandler(
  'Certificate',
  CERT_MANAGER_SUBSECTION_NAME,
  'Certificates',
  CERT_MANAGER_RESOURCE_GROUP,
  CERT_MANAGER_DEFAULT_RESOURCE_VERSION,
  'certificates',
  loadCustomSchema('certmanager/certificate.json', 'Certificate'),
  'https://cert-manager.io/docs/concepts/certificate/',
  [
    {
      source: {
        pathParts: ['spec', 'secretName'],
        siblingMatchers: {
          namespace: implicitNamespaceMatcher,
        },
      },
      type: 'name',
      target: {
        kind: 'Secret',
      },
    },
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

export default CertificateHandler;
