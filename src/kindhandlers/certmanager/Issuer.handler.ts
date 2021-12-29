import {loadCustomSchema} from '@redux/services/schema';

import {
  CERT_MANAGER_DEFAULT_RESOURCE_VERSION,
  CERT_MANAGER_RESOURCE_GROUP,
  CERT_MANAGER_SUBSECTION_NAME,
} from '@src/kindhandlers/certmanager/constants';
import {createNamespacedCustomObjectKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';

const IssuerHandler = createNamespacedCustomObjectKindHandler(
  'Issuer',
  CERT_MANAGER_SUBSECTION_NAME,
  'Issuers',
  CERT_MANAGER_RESOURCE_GROUP,
  CERT_MANAGER_DEFAULT_RESOURCE_VERSION,
  'issuers',
  loadCustomSchema('certmanager/issuer.json', 'Issuer'),
  'https://cert-manager.io/docs/concepts/issuer/'
);

export default IssuerHandler;
