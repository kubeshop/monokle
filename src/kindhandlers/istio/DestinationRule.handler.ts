import {loadCustomSchema} from '@redux/services/schema';

import {createNamespacedCustomObjectKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';
import {
  ISTIO_DEFAULT_RESOURCE_VERSION,
  ISTIO_NETWORKING_RESOURCE_GROUP,
  ISTIO_SUBSECTION_NAME,
} from '@src/kindhandlers/istio/constants';

const DestinationRuleHandler = createNamespacedCustomObjectKindHandler(
  'DestinationRule',
  ISTIO_SUBSECTION_NAME,
  'DestinationRules',
  ISTIO_NETWORKING_RESOURCE_GROUP,
  ISTIO_DEFAULT_RESOURCE_VERSION,
  'destinationrules',
  loadCustomSchema('istio/destinationrule.json', 'DestinationRule'),
  'https://istio.io/latest/docs/reference/config/networking/destination-rule/'
);

export default DestinationRuleHandler;
