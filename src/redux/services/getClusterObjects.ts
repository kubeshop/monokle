import {KubeConfig} from '@kubernetes/client-node';

import {getK8sObjectsAsYaml} from '@redux/thunks/utils';

import {getRegisteredKindHandlers} from '@src/kindhandlers';

const getClusterObjects = async (kc: KubeConfig, namespace: string) => {
  return Promise.allSettled(
    getRegisteredKindHandlers().map(resourceKindHandler =>
      resourceKindHandler
        .listResourcesInCluster(kc, { namespace })
        .then(items => getK8sObjectsAsYaml(items, resourceKindHandler.kind, resourceKindHandler.clusterApiVersion))
    )
  );
};

export default getClusterObjects;
