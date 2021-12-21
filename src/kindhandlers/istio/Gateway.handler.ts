import {createCustomObjectKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';
import {
  ISTIO_DEFAULT_RESOURCE_VERSION,
  ISTIO_RESOURCE_GROUP,
  ISTIO_SUBSECTION_NAME,
} from '@src/kindhandlers/istio/constants';

const GatewayHandler = createCustomObjectKindHandler(
  'Gateway',
  ISTIO_SUBSECTION_NAME,
  'Gateways',
  ISTIO_RESOURCE_GROUP,
  ISTIO_DEFAULT_RESOURCE_VERSION,
  'gateways',
  'istio/gateway.json',
  'https://istio.io/latest/docs/reference/config/networking/gateway/',
  [
    {
      source: {
        pathParts: ['spec', 'selector'],
      },
      target: {
        kind: 'Pod',
        pathParts: ['metadata', 'labels'],
      },
      type: 'pairs',
    },
  ]
);

export default GatewayHandler;
