import {PREVIEW_PREFIX} from '@constants/constants';

import {ResourceFilterType, ResourceMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {SectionBlueprint} from '@models/navigator';

import {selectK8sResource} from '@redux/reducers/main';
import {isKustomizationResource} from '@redux/services/kustomize';
import {isUnsavedResource} from '@redux/services/resource';

import {isResourcePassingFilter} from '@utils/resources';

import {getResourceKindHandler} from '@src/kindhandlers';

import ResourceKindContextMenu from '../K8sResourceSectionBlueprint/ResourceKindContextMenu';
import ResourceKindPrefix from '../K8sResourceSectionBlueprint/ResourceKindPrefix';
import ResourceKindSuffix from '../K8sResourceSectionBlueprint/ResourceKindSuffix';
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

export const UNKNOWN_RESOURCE_SECTION_NAME = 'Unknown Resources' as const;

const UnknownResourceSectionBlueprint: SectionBlueprint<K8sResource, UnknownResourceScopeType> = {
  name: UNKNOWN_RESOURCE_SECTION_NAME,
  id: UNKNOWN_RESOURCE_SECTION_NAME,
  containerElementId: 'navigator-sections-container',
  rootSectionId: UNKNOWN_RESOURCE_SECTION_NAME,
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
          resource.kind !== KUSTOMIZATION_KIND &&
          !getResourceKindHandler(resource.kind) &&
          (scope.isInPreviewMode ? resource.filePath.startsWith(PREVIEW_PREFIX) : true)
      );
    },
    getGroups: scope => {
      const unknownResources = Object.values(scope.resourceMap).filter(
        resource =>
          resource.kind !== KUSTOMIZATION_KIND &&
          !getResourceKindHandler(resource.kind) &&
          !resource.name.startsWith('Patch:') &&
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
      isVisible: (rawItem, scope) => isResourcePassingFilter(rawItem, scope.resourceFilter),
    },
    instanceHandler: {
      onClick: (itemInstance, dispatch) => {
        dispatch(selectK8sResource({resourceId: itemInstance.id}));
      },
    },
    customization: {
      contextMenu: {component: ResourceKindContextMenu, options: {isVisibleOnHover: true}},
      prefix: {component: ResourceKindPrefix},
      suffix: {component: ResourceKindSuffix},
    },
  },
};

sectionBlueprintMap.register(UnknownResourceSectionBlueprint);

export default UnknownResourceSectionBlueprint;
