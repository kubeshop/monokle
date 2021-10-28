import {ClusterToLocalResourcesMatch, ResourceMapType} from '@models/appstate';
import {SectionBlueprint} from '@models/navigator';
import sectionBlueprintMap from '../sectionBlueprintMap';

export type ClusterDiffScopeType = {
  resourceMap: ResourceMapType;
  clusterToLocalResourcesMatches: ClusterToLocalResourcesMatch[];
};

const ClusterDiffSectionBlueprint: SectionBlueprint<ClusterToLocalResourcesMatch, ClusterDiffScopeType> = {
  name: 'K8s Resources Diff',
  id: 'K8s Resources Diff',
  getScope(state) {
    return {
      resourceMap: state.main.resourceMap,
      clusterToLocalResourcesMatches: state.main.navigatorDiff.clusterToLocalResourcesMatches,
    };
  },
  builder: {
    getRawItems(scope) {
      return scope.clusterToLocalResourcesMatches;
    },
    getGroups(scope) {
      const matchesGroupedByResourceKind = scope.clusterToLocalResourcesMatches.reduce<
        Record<string, ClusterToLocalResourcesMatch[]>
      >((acc, match) => {
        if (acc[match.resourceKind]) {
          acc[match.resourceKind].push(match);
        } else {
          acc[match.resourceKind] = [match];
        }
        return acc;
      }, {});
      return Object.entries(matchesGroupedByResourceKind).map(([resourceKind, matches]) => {
        return {
          id: resourceKind,
          name: resourceKind,
          itemIds: matches.map(match => `${match.resourceName}#${match.resourceKind}#${match.resourceNamespace}`),
        };
      });
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
    getInstanceId(rawItem) {
      return `${rawItem.resourceName}#${rawItem.resourceKind}#${rawItem.resourceNamespace}`;
    },
  },
};

sectionBlueprintMap.register(ClusterDiffSectionBlueprint);

export default ClusterDiffSectionBlueprint;
