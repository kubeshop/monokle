import {KubeConfig} from '@kubernetes/client-node';

import {getK8sObjectsAsYaml} from '@redux/thunks/utils';

import {getRegisteredKindHandlers} from '@src/kindhandlers';

const getClusterObjects = async (kc: KubeConfig) => {
  return Promise.allSettled(
    getRegisteredKindHandlers().map(resourceKindHandler =>
      resourceKindHandler
        .listResourcesInCluster(kc)
        .then(items => getK8sObjectsAsYaml(items, resourceKindHandler.kind, resourceKindHandler.clusterApiVersion))
    )
  );
};

export default getClusterObjects;
