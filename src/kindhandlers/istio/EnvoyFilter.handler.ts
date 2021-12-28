import {createNamespacedCustomObjectKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';
import {createPodSelectorOutgoingRefMappers} from '@src/kindhandlers/common/outgoingRefMappers';
import {ISTIO_NETWORKING_RESOURCE_GROUP, ISTIO_SUBSECTION_NAME} from '@src/kindhandlers/istio/constants';

const EnvoyFilterHandler = createNamespacedCustomObjectKindHandler(
  'EnvoyFilter',
  ISTIO_SUBSECTION_NAME,
  'EnvoyFilters',
  ISTIO_NETWORKING_RESOURCE_GROUP,
  'v1alpha3',
  'envoyfilters',
  'istio/envoyfilter.json',
  'https://istio.io/latest/docs/reference/config/networking/envoy-filter/',
  createPodSelectorOutgoingRefMappers(['spec', 'workloadSelector', 'labels'])
);

export default EnvoyFilterHandler;
