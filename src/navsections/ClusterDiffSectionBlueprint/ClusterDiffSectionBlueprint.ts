import {ClusterToLocalResourcesMatch, ResourceFilterType, ResourceMapType} from '@models/appstate';
import {SectionBlueprint} from '@models/navigator';

import {isResourcePassingFilter} from '@utils/resources';

import sectionBlueprintMap from '../sectionBlueprintMap';
import ClusterDiffSectionEmptyDisplay from './ClusterDiffSectionEmptyDisplay';
import ClusterDiffSectionNameDisplay from './ClusterDiffSectionNameDisplay';
import ResourceMatchNameDisplay from './ResourceMatchNameDisplay';

export type ClusterDiffScopeType = {
  resourceMap: ResourceMapType;
  clusterToLocalResourcesMatches: ClusterToLocalResourcesMatch[];
  resourceFilter: ResourceFilterType;
  isPreviewLoading: boolean;
  hasClusterDiffLoaded: boolean;
  isClusterDiffVisible: boolean;
};

const ClusterDiffSectionBlueprint: SectionBlueprint<ClusterToLocalResourcesMatch, ClusterDiffScopeType> = {
  name: 'K8s Resources Diff',
  id: 'K8s Resources Diff',
  getScope(state) {
    return {
      resourceMap: state.main.resourceMap,
      clusterToLocalResourcesMatches: state.main.clusterDiff.clusterToLocalResourcesMatches,
      resourceFilter: state.main.resourceFilter,
      isPreviewLoading: state.main.previewLoader.isLoading,
      hasClusterDiffLoaded: state.main.clusterDiff.hasLoaded,
      isClusterDiffVisible: state.ui.isClusterDiffVisible,
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
      return Object.entries(matchesGroupedByResourceKind)
        .map(([resourceKind, matches]) => {
          return {
            id: resourceKind,
            name: resourceKind,
            itemIds: matches.map(match => `${match.resourceName}#${match.resourceKind}#${match.resourceNamespace}`),
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    isInitialized(scope) {
      return scope.clusterToLocalResourcesMatches.length > 0;
    },
    isLoading(scope) {
      return scope.isClusterDiffVisible && (!scope.hasClusterDiffLoaded || scope.isPreviewLoading);
    },
    isEmpty(_, __, itemInstances) {
      const isSectionEmpty = Boolean(itemInstances && itemInstances.every(i => !i.isVisible));
      return isSectionEmpty;
    },
  },
  customization: {
    nameDisplay: {
      component: ClusterDiffSectionNameDisplay,
    },
    emptyDisplay: {
      component: ClusterDiffSectionEmptyDisplay,
    },
    disableHoverStyle: true,
  },
  itemBlueprint: {
    getName(rawItem) {
      return rawItem.resourceName;
    },
    getInstanceId(rawItem) {
      return `${rawItem.resourceName}#${rawItem.resourceKind}#${rawItem.resourceNamespace}`;
    },
    builder: {
      getMeta(rawItem, scope) {
        return {
          resourceName: rawItem.resourceName,
          resourceKind: rawItem.resourceKind,
          resourceNamespace: rawItem.resourceNamespace,
          clusterResource: rawItem.clusterResourceId ? scope.resourceMap[rawItem.clusterResourceId] : undefined,
          localResources: rawItem.localResourceIds
            ? rawItem.localResourceIds.map(id => scope.resourceMap[id])
            : undefined,
        };
      },
      isVisible(rawItem, scope) {
        const clusterResource = rawItem.clusterResourceId ? scope.resourceMap[rawItem.clusterResourceId] : undefined;
        const firstLocalResource =
          rawItem.localResourceIds && rawItem.localResourceIds.length > 0
            ? scope.resourceMap[rawItem.localResourceIds[0]]
            : undefined;
        if (clusterResource && isResourcePassingFilter(clusterResource, scope.resourceFilter)) {
          return true;
        }
        if (firstLocalResource && isResourcePassingFilter(firstLocalResource, scope.resourceFilter)) {
          return true;
        }
        return false;
      },
    },
    customization: {
      nameDisplay: {component: ResourceMatchNameDisplay},
      disableHoverStyle: true,
    },
  },
};

sectionBlueprintMap.register(ClusterDiffSectionBlueprint);

export default ClusterDiffSectionBlueprint;
