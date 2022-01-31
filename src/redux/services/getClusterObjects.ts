import * as k8s from '@kubernetes/client-node';

import {getK8sObjectsAsYaml} from '@redux/thunks/utils';

import {getRegisteredKindHandlers} from '@src/kindhandlers';

const getClusterObjects = (configPath: string, currentContext: string) => {
  const kc = new k8s.KubeConfig();
  kc.loadFromFile(configPath);
  kc.setCurrentContext(currentContext);

  return Promise.allSettled(
    getRegisteredKindHandlers().map(resourceKindHandler =>
      resourceKindHandler
        .listResourcesInCluster(kc)
        .then(items => getK8sObjectsAsYaml(items, resourceKindHandler.kind, resourceKindHandler.clusterApiVersion))
    )
  );
};

export default getClusterObjects;
