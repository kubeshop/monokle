import {loadCustomSchema} from '@redux/services/schema';

import {
  CERT_MANAGER_ACME_RESOURCE_GROUP,
  CERT_MANAGER_DEFAULT_RESOURCE_VERSION,
  CERT_MANAGER_SUBSECTION_NAME,
} from '@src/kindhandlers/certmanager/constants';
import {createNamespacedCustomObjectKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';

const AcmeOrderHandler = createNamespacedCustomObjectKindHandler(
  'Order',
  CERT_MANAGER_SUBSECTION_NAME,
  'Orders',
  CERT_MANAGER_ACME_RESOURCE_GROUP,
  CERT_MANAGER_DEFAULT_RESOURCE_VERSION,
  'orders',
  loadCustomSchema('certmanager/acmeorder.json', 'Order'),
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

export default AcmeOrderHandler;
