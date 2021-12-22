import {createSelectorOutgoingRefMappers} from '@src/kindhandlers/Service.handler';
import {createNamespacedCustomObjectKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';
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

export default EnvoyFilterHandler;
