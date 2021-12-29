import {loadCustomSchema} from '@redux/services/schema';

import {createNamespacedCustomObjectKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';
import {ISTIO_NETWORKING_RESOURCE_GROUP, ISTIO_SUBSECTION_NAME} from '@src/kindhandlers/istio/constants';

const WorkloadGroupHandler = createNamespacedCustomObjectKindHandler(
  'WorkloadGroup',
  ISTIO_SUBSECTION_NAME,
  'WorkloadGroups',
  ISTIO_NETWORKING_RESOURCE_GROUP,
  'v1alpha3',
  'workloadgroups',
  loadCustomSchema('istio/workloadgroup.json', 'WorkloadGroup'),
  'https://istio.io/latest/docs/reference/config/networking/workload-group/'
);

export default WorkloadGroupHandler;
