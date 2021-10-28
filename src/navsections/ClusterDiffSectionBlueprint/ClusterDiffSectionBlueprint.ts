import {ClusterToLocalResourcesMatch, ResourceMapType} from '@models/appstate';
import {SectionBlueprint} from '@models/navigator';
import {makeResourceNameKindNamespaceIdentifier} from '@utils/resources';
import {v4 as uuidv4} from 'uuid';

export type ClusterDiffScopeType = {
  resourceMap: ResourceMapType;
  clusterToLocalResourcesMatches: ClusterToLocalResourcesMatch[];
};

const ClusterDiffSectionBlueprint: SectionBlueprint<ClusterToLocalResourcesMatch, ClusterDiffScopeType> = {
  name: 'Cluster Diff',
  id: 'Cluster Diff',
  getScope(state) {
    return {
      resourceMap: state.main.resourceMap,
      clusterToLocalResourcesMatches: state.main.clusterToLocalResourcesMatches,
    };
  },
  builder: {
    getRawItems(scope) {
      return scope.clusterToLocalResourcesMatches;
    },
    isInitialized(scope) {
      return scope.clusterToLocalResourcesMatches.length > 0;
    },
  },
  itemBlueprint: {
    getName(rawItem, scope) {
      const clusterResource = rawItem.clusterResourceId ? scope.resourceMap[rawItem.clusterResourceId] : undefined;
      const firstLocalResource =
        rawItem.localResourceIds && rawItem.localResourceIds.length > 0
          ? scope.resourceMap[rawItem.localResourceIds[0]]
          : undefined;
      const leftName = clusterResource ? clusterResource.name : 'Resource not found in Cluster.';
      const rightName = firstLocalResource ? firstLocalResource.name : 'Resource not found locally.';
      return `${leftName} <---> ${rightName}`;
    },
    getInstanceId(rawItem, scope) {
      if (rawItem.clusterResourceId) {
        const clusterResource = scope.resourceMap[rawItem.clusterResourceId];
        return makeResourceNameKindNamespaceIdentifier(clusterResource);
      }
      if (rawItem.localResourceIds && rawItem.localResourceIds.length > 0) {
        const firstLocalResource = scope.resourceMap[rawItem.localResourceIds[0]];
        return makeResourceNameKindNamespaceIdentifier(firstLocalResource);
      }
      return uuidv4();
    },
  },
};

export default ClusterDiffSectionBlueprint;
