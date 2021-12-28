import {createNamespacedCustomObjectKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';
import {createPodSelectorOutgoingRefMappers} from '@src/kindhandlers/common/outgoingRefMappers';
import {
  ISTIO_DEFAULT_RESOURCE_VERSION,
  ISTIO_NETWORKING_RESOURCE_GROUP,
  ISTIO_SUBSECTION_NAME,
} from '@src/kindhandlers/istio/constants';

const GatewayHandler = createNamespacedCustomObjectKindHandler(
  'Gateway',
  ISTIO_SUBSECTION_NAME,
  'Gateways',
  ISTIO_NETWORKING_RESOURCE_GROUP,
  ISTIO_DEFAULT_RESOURCE_VERSION,
  'gateways',
  'istio/gateway.json',
  'https://istio.io/latest/docs/reference/config/networking/gateway/',
  createPodSelectorOutgoingRefMappers()
);

export default GatewayHandler;
