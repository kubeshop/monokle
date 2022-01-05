import {createNamespacedCustomObjectKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';
import {createPodSelectorOutgoingRefMappers} from '@src/kindhandlers/common/outgoingRefMappers';
import {
  ISTIO_DEFAULT_RESOURCE_VERSION,
  ISTIO_NETWORKING_RESOURCE_GROUP,
  ISTIO_SUBSECTION_NAME,
} from '@src/kindhandlers/istio/constants';

const SidecarHandler = createNamespacedCustomObjectKindHandler(
  'Sidecar',
  ISTIO_SUBSECTION_NAME,
  'Sidecars',
  ISTIO_NETWORKING_RESOURCE_GROUP,
  ISTIO_DEFAULT_RESOURCE_VERSION,
  'sidecars',
  'istio/sidecar.json',
  'https://istio.io/latest/docs/reference/config/networking/sidecar/',
  createPodSelectorOutgoingRefMappers(['spec', 'workloadSelector', 'labels'])
);

export default SidecarHandler;
