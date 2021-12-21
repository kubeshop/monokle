import {createSelectorOutgoingRefMappers} from '@src/kindhandlers/Service.handler';
import {createCustomObjectKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';
import {
  ISTIO_DEFAULT_RESOURCE_VERSION,
  ISTIO_NETWORKING_RESOURCE_GROUP,
  ISTIO_SUBSECTION_NAME,
} from '@src/kindhandlers/istio/constants';

const SidecarHandler = createCustomObjectKindHandler(
  'Sidecar',
  ISTIO_SUBSECTION_NAME,
  'Sidecars',
  ISTIO_NETWORKING_RESOURCE_GROUP,
  ISTIO_DEFAULT_RESOURCE_VERSION,
  'sidecars',
  'istio/sidecar.json',
  'https://istio.io/latest/docs/reference/config/networking/sidecar/',
  [
    {
      source: {
        pathParts: ['spec', 'workloadSelector', 'labels'],
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

export default SidecarHandler;
