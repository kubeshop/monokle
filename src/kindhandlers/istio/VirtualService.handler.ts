import {loadCustomSchema} from '@redux/services/schema';

import {createNamespacedCustomObjectKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';
import {
  ISTIO_DEFAULT_RESOURCE_VERSION,
  ISTIO_NETWORKING_RESOURCE_GROUP,
  ISTIO_SUBSECTION_NAME,
} from '@src/kindhandlers/istio/constants';

const VirtualServiceHandler = createNamespacedCustomObjectKindHandler(
  'VirtualService',
  ISTIO_SUBSECTION_NAME,
  'VirtualServices',
  ISTIO_NETWORKING_RESOURCE_GROUP,
  ISTIO_DEFAULT_RESOURCE_VERSION,
  'virtualservices',
  loadCustomSchema('istio/virtualservice.json', 'VirtualService'),
  'https://istio.io/latest/docs/reference/config/networking/virtual-service/',
  [
    {
      source: {
        pathParts: ['spec', 'gateways', '*'],
      },
      type: 'name',
      target: {
        kind: 'Gateway',
      },
    },
  ]
);

export default VirtualServiceHandler;
