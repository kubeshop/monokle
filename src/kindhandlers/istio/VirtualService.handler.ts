import {createCustomObjectKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';
import {
  ISTIO_DEFAULT_RESOURCE_VERSION,
  ISTIO_NETWORKING_RESOURCE_GROUP,
  ISTIO_SUBSECTION_NAME,
} from '@src/kindhandlers/istio/constants';

const VirtualServiceHandler = createCustomObjectKindHandler(
  'VirtualService',
  ISTIO_SUBSECTION_NAME,
  'VirtualServices',
  ISTIO_NETWORKING_RESOURCE_GROUP,
  ISTIO_DEFAULT_RESOURCE_VERSION,
  'virtualservices',
  'istio/virtualservice.json',
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
