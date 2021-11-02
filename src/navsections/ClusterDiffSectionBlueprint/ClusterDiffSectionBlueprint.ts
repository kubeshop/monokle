import {ClusterToLocalResourcesMatch, ResourceMapType} from '@models/appstate';
import {SectionBlueprint} from '@models/navigator';
import sectionBlueprintMap from '../sectionBlueprintMap';
import ClusterDiffNameDisplay from './ClusterDiffNameDisplay';

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
    getName(rawItem) {
      return `${rawItem.resourceName}#${rawItem.resourceKind}#${rawItem.resourceNamespace}`;
    },
    getInstanceId(rawItem) {
      return `${rawItem.resourceName}#${rawItem.resourceKind}#${rawItem.resourceNamespace}`;
    },
    builder: {
      getMeta(rawItem, scope) {
        return {
          clusterResource: rawItem.clusterResourceId ? scope.resourceMap[rawItem.clusterResourceId] : undefined,
          localResources: rawItem.localResourceIds
            ? rawItem.localResourceIds.map(id => scope.resourceMap[id])
            : undefined,
        };
      },
    },
    customization: {
      nameDisplay: {component: ClusterDiffNameDisplay},
    },
  },
};

sectionBlueprintMap.register(ClusterDiffSectionBlueprint);

export default ClusterDiffSectionBlueprint;
