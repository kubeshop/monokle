import {createNamespacedCustomObjectKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';
import {
  createPodSelectorOutgoingRefMappers,
  implicitNamespaceMatcher,
} from '@src/kindhandlers/common/outgoingRefMappers';
import {
  ISTIO_DEFAULT_RESOURCE_VERSION,
  ISTIO_NETWORKING_RESOURCE_GROUP,
  ISTIO_SUBSECTION_NAME,
} from '@src/kindhandlers/istio/constants';

const WorkloadEntryHandler = createNamespacedCustomObjectKindHandler(
  'WorkloadEntry',
  ISTIO_SUBSECTION_NAME,
  'WorkloadEntries',
  ISTIO_NETWORKING_RESOURCE_GROUP,
  ISTIO_DEFAULT_RESOURCE_VERSION,
  'workloadentries',
  'istio/workloadentry.json',
  'https://istio.io/latest/docs/reference/config/networking/workload-entry/',
  [
    {
      source: {
        pathParts: ['spec', 'serviceAccount'],
        siblingMatchers: {
          namespace: implicitNamespaceMatcher,
        },
      },
      target: {
        kind: 'ServiceAccount',
      },
      type: 'name',
    },
    ...createPodSelectorOutgoingRefMappers(['spec', 'workloadSelector', 'labels']),
  ]
);

export default WorkloadEntryHandler;
