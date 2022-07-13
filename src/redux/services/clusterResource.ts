import {stringify} from 'yaml';

import {K8sResource} from '@models/k8sresource';

import {getResourceFromCluster} from '@redux/thunks/utils';

import {getResourceKindHandler} from '@src/kindhandlers';

export const getClusterResourceText = async (localResource: K8sResource, kubeconfig: string, context: string) => {
  try {
    const resourceKindHandler = getResourceKindHandler(localResource.kind);
    if (!resourceKindHandler) {
      throw new Error(`Could not find Kind Handler for resoruce ${localResource.id}`);
    }

    const handleResource = (res: any) => {
      if (res.body) {
        delete res.metadata?.managedFields;
        return {clusterResourceText: stringify(res, {sortMapEntries: true})};
      }

      throw new Error(`Failed to get ${localResource.content.kind} from cluster`);
    };

    const handleRejection = () => {
      throw new Error(`${localResource.content.kind} ${localResource.content.metadata.name} not found in cluster`);
    };

    try {
      const resourceFromCluster = await getResourceFromCluster(localResource, kubeconfig, context);
      return handleResource(resourceFromCluster);
    } catch {
      return handleRejection();
    }
  } catch (e: any) {
    throw new Error(`Failed to diff resources; ${e.message}`);
  }
};
