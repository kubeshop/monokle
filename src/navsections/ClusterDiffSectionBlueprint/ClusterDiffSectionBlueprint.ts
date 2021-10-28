import {ClusterToLocalResourcesMatch, ResourceMapType} from '@models/appstate';
import {SectionBlueprint} from '@models/navigator';
import {makeResourceNameKindNamespaceIdentifier} from '@utils/resources';
import {v4 as uuidv4} from 'uuid';

type ClusterDiffScopeType = {
  resourceMap: ResourceMapType;
  clusterToLocalResourcesMatches: ClusterToLocalResourcesMatch[];
};

const getResourceIdentifierFromMatch = (match: ClusterToLocalResourcesMatch, resourceMap: ResourceMapType) => {
  if (match.clusterResourceId) {
    const clusterResource = resourceMap[match.clusterResourceId];
    return makeResourceNameKindNamespaceIdentifier(clusterResource);
  }
  if (match.localResourceIds && match.localResourceIds.length > 0) {
    const firstLocalResource = resourceMap[match.localResourceIds[0]];
    return makeResourceNameKindNamespaceIdentifier(firstLocalResource);
  }
  return uuidv4();
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
      return getResourceIdentifierFromMatch(rawItem, scope.resourceMap);
    },
    getInstanceId(rawItem, scope) {
      return getResourceIdentifierFromMatch(rawItem, scope.resourceMap);
    },
  },
};

export default ClusterDiffSectionBlueprint;
