import {loadCustomSchema} from '@redux/services/schema';

import {createNamespacedCustomObjectKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';
import {createPodSelectorOutgoingRefMappers} from '@src/kindhandlers/common/outgoingRefMappers';
import {
  ISTIO_DEFAULT_RESOURCE_VERSION,
  ISTIO_NETWORKING_RESOURCE_GROUP,
  ISTIO_SUBSECTION_NAME,
} from '@src/kindhandlers/istio/constants';

const ServiceEntryHandler = createNamespacedCustomObjectKindHandler(
  'ServiceEntry',
  ISTIO_SUBSECTION_NAME,
  'ServiceEntries',
  ISTIO_NETWORKING_RESOURCE_GROUP,
  ISTIO_DEFAULT_RESOURCE_VERSION,
  'serviceentries',
  loadCustomSchema('istio/serviceentry.json', 'ServiceEntry'),
  'https://istio.io/latest/docs/reference/config/networking/service-entry/',
  createPodSelectorOutgoingRefMappers(['spec', 'workloadSelector', 'labels'])
);

export default ServiceEntryHandler;
