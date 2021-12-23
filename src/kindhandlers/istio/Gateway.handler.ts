import {createSelectorOutgoingRefMappers} from '@src/kindhandlers/Service.handler';
import {createNamespacedCustomObjectKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';
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
    createSelectorOutgoingRefMappers('DaemonSet'),
    createSelectorOutgoingRefMappers('Deployment'),
    createSelectorOutgoingRefMappers('Job'),
    createSelectorOutgoingRefMappers('ReplicaSet'),
    createSelectorOutgoingRefMappers('ReplicationController'),
    createSelectorOutgoingRefMappers('StatefulSet'),
  ]
);

export default GatewayHandler;
