import {KUSTOMIZATION_KIND, PREVIEW_PREFIX} from '@constants/constants';

import {ResourceFilterType, ResourceMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {SectionBlueprint} from '@models/navigator';

import {selectK8sResource} from '@redux/reducers/main';
import {isUnsavedResource} from '@redux/services/resource';

import {isResourcePassingFilter} from '@utils/resources';

import {ResourceKindHandlers} from '@src/kindhandlers';

import sectionBlueprintMap from '../sectionBlueprintMap';

export type UnknownResourceScopeType = {
  resourceMap: ResourceMapType;
  resourceFilter: ResourceFilterType;
  selectedPath?: string;
  selectedResourceId?: string;
  isInPreviewMode: boolean;
  isPreviewLoading: boolean;
  isFolderLoading: boolean;
};

const KnownResourceKinds: string[] = [KUSTOMIZATION_KIND, ...ResourceKindHandlers.map(kindHandler => kindHandler.kind)];

const UnknownResourceSectionBlueprint: SectionBlueprint<K8sResource, UnknownResourceScopeType> = {
  name: 'Unknown Resources',
  id: 'Unknown Resources',
  getScope: state => {
    return {
      resourceMap: state.main.resourceMap,
      resourceFilter: state.main.resourceFilter,
      selectedPath: state.main.selectedPath,
      selectedResourceId: state.main.selectedResourceId,
      isInPreviewMode: Boolean(state.main.previewResourceId) || Boolean(state.main.previewValuesFileId),
      isPreviewLoading: state.main.previewLoader.isLoading,
      isFolderLoading: state.ui.isFolderLoading,
    };
  },
  builder: {
    getRawItems: scope => {
      return Object.values(scope.resourceMap).filter(
        resource =>
          !KnownResourceKinds.includes(resource.kind) &&
          (scope.isInPreviewMode ? resource.filePath.startsWith(PREVIEW_PREFIX) : true)
      );
    },
    getGroups: scope => {
      const unknownResources = Object.values(scope.resourceMap).filter(
        resource =>
          !KnownResourceKinds.includes(resource.kind) &&
          (scope.isInPreviewMode ? resource.filePath.startsWith(PREVIEW_PREFIX) : true)
      );
      const unknownResourcesByKind: Record<string, K8sResource[]> = unknownResources.reduce<
        Record<string, K8sResource[]>
      >((acc, resource) => {
        if (acc[resource.kind]) {
          acc[resource.kind].push(resource);
        } else {
          acc[resource.kind] = [resource];
        }
        return acc;
      }, {});
      return Object.entries(unknownResourcesByKind)
        .map(([resourceKind, resources]) => {
          return {
            id: resourceKind,
            name: resourceKind,
            itemIds: resources.map(r => r.id),
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    isVisible: (_, rawItems) => {
      return rawItems.length > 0;
    },
    isLoading: scope => {
      return scope.isPreviewLoading || scope.isFolderLoading;
    },
    isInitialized: (_, rawItems) => {
      return rawItems.length > 0;
    },
  },
  itemBlueprint: {
    getName: rawItem => rawItem.name,
    getInstanceId: rawItem => rawItem.id,
    builder: {
      isSelected: rawItem => rawItem.isSelected,
      isHighlighted: rawItem => rawItem.isHighlighted,
      isDirty: rawItem => isUnsavedResource(rawItem),
      isVisible: (rawItem, scope) => {
        const isPassingFilter = isResourcePassingFilter(rawItem, scope.resourceFilter);
        return isPassingFilter;
      },
      shouldScrollIntoView: (rawItem, scope) => {
        if (rawItem.isHighlighted && scope.selectedPath) {
          return true;
        }
        if (rawItem.isSelected && scope.selectedResourceId) {
          return true;
        }
        return false;
      },
    },
    instanceHandler: {
      onClick: (itemInstance, dispatch) => {
        dispatch(selectK8sResource({resourceId: itemInstance.id}));
      },
    },
  },
};

sectionBlueprintMap.register(UnknownResourceSectionBlueprint);

export default UnknownResourceSectionBlueprint;
